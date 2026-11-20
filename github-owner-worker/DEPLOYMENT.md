# GitHub Single Owner Admin — Cloudflare Worker deployment

## Implementation and activation state

The Firebase runtime has been replaced in the live admin page by a **GitHub App OAuth (user-to-server) + Cloudflare Worker** implementation. This repository's `admin/github-config.js` currently has `enabled:false`. Until the Worker and GitHub App credentials are provisioned, the old manually entered GitHub fine-grained token remains the administrator's fallback. **This is not live GitHub OAuth until configured and deployed.**

- Current admin: `https://yscho-hgu.github.io/engineering-learning-studio/admin/`
- Worker: `github-owner-worker/src/index.js`; Cloudflare deploy config `github-owner-worker/wrangler.toml`.
- One owner: fixed GitHub numeric `OWNER_GITHUB_ID` **and** a verified GitHub account email `yscho@handong.edu` (not merely a matching public profile email).
- Current admin edits: **only** C Programming `c-programming/course-catalog.json` and S&S `course-catalog.json`. No arbitrary repository/path access.
- GitHub OAuth access tokens and App signing keys remain on the Worker. The browser gets a signed, short-lived, non-GitHub session bearer (30 min, memory only).
- A browser session ends on logout, refresh or timeout. **Stateless tokens cannot be revoked individually**: stolen session tokens remain valid until expiry. For later role-based or persistent sessions add revocation storage (Cloudflare KV/D1).

## Step 1 — GitHub App (no Firebase or Google Cloud)

Create a GitHub App owned by the account with access to both repositories. Enable OAuth authorization callback and set the **exact callback URL** to:

`https://<your-worker-hostname>/auth/github/callback`

GitHub App permissions:
- Repository: **Contents: Read & write**, Metadata: Read.
- Account: **Email addresses: Read** (required to check the verified school email).
- Install only in `YSCho-HGU/engineering-learning-studio` and `YSCho-HGU/signals-systems-visual-lab`.
- Set **User-to-server token expiration** enabled, and keep the app's client secret safe.
- A single installation ID can serve both repos if they're installed under the same owner/installation.

Record the non-sensitive identifiers **Client ID, App ID, Installation ID** and your GitHub profile's **numeric user ID**, distinct from the username. Obtain the numeric ID via the authenticated GitHub REST `GET /user` API or GitHub profile API as appropriate. Email is checked on `GET /user/emails`: the address must have `verified:true`.

Generate the app private PEM key. Cloudflare Web Crypto currently imports **PKCS#8** RSA private keys for signing; GitHub PEM files may use PKCS#1 (`BEGIN RSA PRIVATE KEY`). Convert locally without exposing the key:

```sh
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in github-app.pem -out github-app-pkcs8.pem
```

Use the resulting `-----BEGIN PRIVATE KEY-----` file for the Worker secret. Never commit either PEM file.

## Step 2 — Deploy Worker

Create a Cloudflare account and enable Workers. On a trusted Windows terminal with Node.js:

```powershell
cd engineering-learning-studio\github-owner-worker
npm install
npm test
npx wrangler login
npx wrangler deploy
```

The first deploy produces the Worker hostname. Configure its GitHub App callback URL exactly as above. Then register configuration using **Worker Secrets** (the CLI will prompt for each value). The public identifiers may also be managed as Worker environment variables; this example uses Secrets uniformly:

```powershell
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put GITHUB_APP_ID
npx wrangler secret put GITHUB_INSTALLATION_ID
npx wrangler secret put GITHUB_APP_PRIVATE_KEY
npx wrangler secret put OWNER_GITHUB_ID
npx wrangler secret put SESSION_SECRET
npx wrangler secret put OAUTH_CALLBACK_URL
```

- `SESSION_SECRET`: generate at least **32 cryptographically random characters** locally and store it as a Worker secret.
- `OAUTH_CALLBACK_URL`: `https://<your-worker-hostname>/auth/github/callback`.
- `GITHUB_APP_PRIVATE_KEY`: paste the **PKCS#8** key with original newlines. Verify exact multiline contents through Cloudflare secret management.
- Never commit App private key, OAuth client secret, or session signing secret to GitHub.
- The Worker is publicly reachable only as an OAuth entrypoint. Every API call validates signed session token, owner numeric ID, GitHub verified email at login, CORS origin and metadata allowlist.

### Suggested budget and protection

Cloudflare Workers Free/paid eligibility, quotas and limits can change. Verify the plan before launch; activate account 2FA and basic traffic/abuse monitoring. A request-limit/WAF rule for `/auth/github/start` and `/auth/github/callback` is appropriate.

## Step 3 — API smoke test

Without credentials, a request from the administrator origin to `/api/catalog?course=c` must return **401**. Requests from other origins must return **403**. The OAuth callback requires the valid state cookie and matching state query.

When logged in with the registered owner, reads of C and S&S catalogs must return `{catalog,sha}`. PUT on an unknown course, changed IDs, unpublished nonexisting paths, invalid `book` URL, stale SHA, or missing authorization must fail. A valid metadata-only PUT creates a GitHub commit.

Do not paste authorization tokens or PEM contents into issue trackers, screenshots, terminal history, or chats.

## Step 4 — Activate GitHub login on the existing Pages site

Edit `admin/github-config.js`:

```js
window.STUDIO_ADMIN_GITHUB=Object.freeze({
 enabled:true,
 workerUrl:"https://<your-worker-hostname>"
});
```

Commit this public config. When GitHub Pages deploys, the admin screen shows **Login with GitHub** instead of manual token entry. The Worker sends the session directly to the Pages opener using `postMessage` with a **fixed origin**; the page checks the exact Worker origin and popup window identity. The browser sends only the 30-minute signed Worker session via `Authorization` on catalog calls.

**Do not enable this flag before the Worker is fully functional**. In enabled mode there is no manual-token fallback.

## Tests

```sh
cd github-owner-worker
npm test
cd ..
node tests/studio-admin.mjs
node tests/studio-admin-github.mjs
```

The repository's `Integrated Studio Admin QA` workflow runs Worker OAuth protocol unit tests and a mocked Chromium login/editor/logout journey. **Mock tests are not live GitHub OAuth verification**. The remaining live activation requires the user's GitHub App and Cloudflare credentials.

## Security limitations

- This is a **single owner** system. Additional editors require a server-side ACL/roles design.
- Current file API manages *catalog metadata only*. More admin functions can be added later through discrete, validated endpoints; do not introduce an unrestricted arbitrary-file GitHub proxy.
- `published:false` hides public menu entries; it does **not** make a GitHub Pages URL private.
- GitHub email can be private; only verified emails returned through OAuth `/user/emails` are accepted.
- Sessions are not written to localStorage or cookies. Refreshing the page requires login again. Logout cannot revoke a previously copied token before its 30-minute expiry; reducing expiry or adding a session revocation store can mitigate this.
- GitHub App installation token is generated server-side from its private key; the raw OAuth token and installation token never leave the Worker.
- Protect the GitHub account with passkeys or 2FA, and audit GitHub App permissions regularly.

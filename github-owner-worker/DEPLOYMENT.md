# Engineering Learning Studio — GitHub Owner Admin / Cloudflare Worker deployment

## Current state — 2026-11-22

This repository contains an **implemented but not yet activated** GitHub App OAuth and Cloudflare Worker integration. The public `admin/github-config.js` remains **enabled:false**, with no Worker URL. The /admin/ page is fail-closed; there is **no PAT-based fallback**. Do not claim that production authentication is complete until an actual owner login and Worker API checks have passed.

The current single-owner policy requires BOTH a GitHub user numeric ID equal to `OWNER_GITHUB_ID` and a GitHub **verified** email equal to `yscho@handong.edu`. The Worker grants only catalog metadata reads and guarded writes.

Both course catalogs now live in **YSCho-HGU/engineering-learning-studio**:
- C: `c-programming/course-catalog.json`
- Signals & Systems: `signals-systems/course-catalog.json`

A publishing change validates that `signals-systems/chapterN.html` (or the C course lesson page) exists before publishing. Do not point the editor back to the legacy `signals-systems-visual-lab` repository.

## 1. Prepare Cloudflare and a GitHub App

You need the **Cloudflare account owner** to provision Workers and choose the existing `workers.dev` subdomain. The Worker script is named `els-owner-admin` in `github-owner-worker/wrangler.toml`. The resulting HTTPS hostname should be known **before** creating the GitHub App, so the callback can match exactly:

`https://els-owner-admin.<YOUR-CLOUDFLARE-SUBDOMAIN>.workers.dev/auth/github/callback`

Do not use a guessed hostname; read your actual Workers subdomain in the Cloudflare dashboard. A custom HTTPS domain is also possible but must match every configured URL exactly.

Create a GitHub App owned by the account that can install it on the repository. Configure:
- **User authorization callback**: the exact Worker URL plus `/auth/github/callback`
- **Repository permission**: Contents — Read and write; Metadata — Read
- **Account permission**: Email addresses — Read
- **Install only in** `YSCho-HGU/engineering-learning-studio`. The legacy Signals repository is not required.

Record the App Client ID, App ID and Installation ID; obtain the **numeric GitHub user ID of the account that will sign in**. Ensure the GitHub account lists `yscho@handong.edu` as a verified email. An email entered on a web form, an unverified profile address or an account with a different numeric ID will be denied.

Generate and protect the GitHub App private key. If the GitHub App downloads an RSA PKCS#1 PEM, convert it locally to a PKCS#8 PEM (never upload it to this public repository):

```powershell
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in github-app.pem -out github-app-pkcs8.pem
```

Use the full contents of the `-----BEGIN PRIVATE KEY-----` PKCS#8 PEM when provisioning the key.

## 2. Provision encrypted GitHub Actions secrets

In the GitHub repository, open Settings → Secrets and variables → Actions → Repository secrets. Set the following **secret names** (values must not be pasted in chat, code, PR comments or screenshots):

| Secret name | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Actual Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Scope-limited token permitted to create/update the Worker and manage its secrets |
| `GITHUB_CLIENT_ID` | GitHub App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `GITHUB_APP_ID` | GitHub App numeric App ID |
| `GITHUB_INSTALLATION_ID` | App installation ID for the repo |
| `GITHUB_APP_PRIVATE_KEY` | Entire multiline PKCS#8 PEM |
| `OWNER_GITHUB_ID` | Verified owner's **numeric** GitHub user ID |
| `SESSION_SECRET` | At least 32 high-entropy random bytes/characters |
| `OAUTH_CALLBACK_URL` | The exact Worker HTTPS callback URL |

Choose a **least-privilege** Cloudflare API token scoped to this account, Workers Scripts edit and the Worker secrets needed to deploy; avoid broad account administration rights.

For `SESSION_SECRET`, use a cryptographic random generator locally. On Windows PowerShell with .NET:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Avoid spaces or newlines in this value. The authentication code signs only 30-minute owner sessions. The Worker and Cloudflare APIs cannot verify account ownership without the above credentials.

## 3. Deploy with the prepared manual GitHub Actions workflow

In GitHub Actions, select **Deploy Owner Admin Worker (manual)** → Run workflow → main. The workflow:
1. Runs existing Worker protocol and catalog tests.
2. Checks required secret presence, callback URL format and owner numeric ID.
3. Deploys the script with `cloudflare/wrangler-action@v4` and writes Worker secrets.
4. Confirms the callback hostname matches the real deployment URL.
5. Confirms `GET /api/catalog?course=c` from `Origin: https://yscho-hgu.github.io` **without a bearer** returns HTTP **401**, and an unapproved Origin returns **403**.

A green deployment is a **necessary, not sufficient**, requirement for enabling the UI. It does not prove a real GitHub login succeeded. If the hostname differs, correct the callback URL in GitHub App and `OAUTH_CALLBACK_URL`, then redeploy. A missing secret must fail rather than expose unprotected data.

### Optional: deploy locally with Wrangler

```powershell
cd engineering-learning-studio\github-owner-worker
npm install
npm test
npx wrangler login
npx wrangler deploy
```

If deploying locally instead of Actions, provision the eight Worker secrets with `npx wrangler secret put SECRET_NAME` and then repeat the same unauthorized smoke tests. Do not place keys in `wrangler.toml` or `admin/github-config.js`.

## 4. Activate the public admin interface only after deployment

Update the public **nonsecret** file `admin/github-config.js` with the verified Worker base URL:

```js
window.STUDIO_ADMIN_GITHUB=Object.freeze({
 enabled:true,
 workerUrl:"https://els-owner-admin.<YOUR-CLOUDFLARE-SUBDOMAIN>.workers.dev"
});
```

Commit the change to main so GitHub Pages publishes it. Public `/admin/` will now display the GitHub login control. No secrets belong in this file.

## 5. Complete *real-account* acceptance testing

Visit `https://yscho-hgu.github.io/engineering-learning-studio/admin/` and verify:

- **Unauthenticated**: editor and QA controls are not shown; Worker API returns 401.
- **Wrong GitHub user or unverified school email**: authentication is rejected (HTTP 403 at callback) without an owner session.
- **Correct GitHub user ID plus verified `yscho@handong.edu`**: login produces a short-lived session, C and S&S catalogs load, editor opens.
- **Catalog update**: make a small legitimate metadata-only change, save and confirm the intended file/commit in the integrated GitHub repository. Revert the test change if appropriate.
- **Logout / expiry**: editor is hidden, session is cleared, API rejects requests without a valid session.

The static HTML of public GitHub Pages remains publicly downloadable; the **Worker**, not a hidden menu or an email string in JavaScript, enforces API permissions. To protect the source of the admin UI or confidential QA data from public access, host those resources behind separate authenticated hosting.

## 6. Troubleshooting

| Failure | Typical cause |
|---|---|
| GitHub login button absent | `enabled:false` or missing/invalid Worker URL |
| Worker API 503 | Missing Worker secret, incorrect key format or callback URL |
| Callback state verification fails | Missing state cookie, mismatched domain/redirect or expired state |
| GitHub identity rejected | Different numeric GitHub ID, unverified school email or Email addresses permission missing |
| GitHub App installation API rejected | Wrong Installation ID, app key or repo Contents permissions |
| Admin loads C but not S&S | Check `signals-systems/course-catalog.json` and Worker catalog-core version |
| Browser CORS error | Verify exact `https://yscho-hgu.github.io` origin and Worker deployment |

## Security and operational notes

SessionStorage is per tab; session tokens expire after 30 minutes. Logout clears the browser session but does **not** revoke already copied stateless tokens until expiry. Use GitHub passkeys or 2FA, keep App and Cloudflare credentials outside the public repo, and rotate leaked secrets immediately. Review Cloudflare Worker usage and GitHub App installations periodically.

Automatic unit tests and mocked browser tests are useful, but **cannot substitute for real GitHub App consent and Cloudflare account access**. That final owner verification must occur with the actual authorized account.

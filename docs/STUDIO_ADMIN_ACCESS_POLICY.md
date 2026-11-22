# Engineering Learning Studio — Owner-only Admin Access Policy

## Current implementation
- The public Studio Home header contains **no** C-only `Learning Progress` link and **no** `Course Manager` link.
- The public URL `/engineering-learning-studio/admin/` is a direct-entry login route. On GitHub Pages, requests for `/admin` are normally redirected to `/admin/`.
- No editor, QA dashboard, catalog controls, or browser GitHub Personal Access Token (PAT) form is displayed before authorization. The former `c-programming/admin/` entry redirects here.
- The browser PAT path was removed from the unified editor. All catalog GET/PUT actions now require the Cloudflare Owner Worker and its signed short-lived session.
- The `admin-private` section is hidden and inert until a GET to the authenticated Worker `/api/catalog?course=c` succeeds.
- The QA scripts are requested only after that server-side check. All authenticated catalog API operations remain independently verified by the Worker.
- This is a **fail-closed** transition: `admin/github-config.js` currently has `enabled:false`. No one, including the owner, can edit catalogs through the site until the GitHub App and Worker are deployed and enabled.

## Account verification
The Worker creates an administrator session only if **both** conditions are true:

1. GitHub authenticated `profile.id` exactly matches the configured numeric `OWNER_GITHUB_ID`.
2. GitHub `GET /user/emails` lists `yscho@handong.edu` with `verified:true`.

A matching browser-provided email, a forged JavaScript event, or an unverified public profile email is not sufficient. GitHub OAuth/App credentials, private key, and installation tokens remain in Worker secrets; a browser receives only a signed 30-minute session token.

## Required activation
The existing implementation and step-by-step instructions are in `github-owner-worker/DEPLOYMENT.md`:

1. Register a GitHub App with repository Contents read/write access limited to the required repositories and account Email addresses read permission.
2. Deploy `github-owner-worker/` as a Cloudflare Worker. Provision `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`, `OWNER_GITHUB_ID`, `SESSION_SECRET`, `OAUTH_CALLBACK_URL` outside GitHub.
3. Confirm unauthenticated `GET /api/catalog?course=c` returns **401**, unapproved Origin returns **403**, and only the verified owner can authenticate.
4. Set `admin/github-config.js` to `enabled:true` with the verified HTTPS Worker URL, then redeploy the site.
5. Verify login, unauthorized rejection, catalog reads/edits, logout, expired sessions, and no browser PAT form.

**Do not enable the client setting before the server is live.**

## Security boundaries

GitHub Pages is a **public static host**. The existence and downloaded source code of `/admin/` and its JavaScript cannot be made private by hiding a link, `robots` directives, `hidden` attributes, or JavaScript. The login gate is for user experience; the Worker is the security boundary for catalog APIs. Public GitHub repository contents and public QA report files remain public even if the admin dashboard is hidden.

If the requirement is to prevent *anyone else from fetching the administrator HTML/source or private reports*, move the admin frontend and private reports behind a separately authenticated hosting/access gateway (for example a protected custom-domain route with Cloudflare Access), instead of serving them from public GitHub Pages.

## Regression checks
- `tests/studio-admin.mjs`: public header, fail-closed no-auth state, no PAT form, no unauthorized network request, redirect from retired C admin
- `tests/studio-admin-github.mjs`: simulated Owner OAuth, forged-event rejection, authenticated Worker response, editor CRUD, same-tab refresh, logout
- `github-owner-worker/tests/`: numeric owner ID, verified email, signed token verification and API protections
- `.github/workflows/studio-admin.yml`: integrates these checks

Mocked browser tests do not substitute for live Worker/GitHub OAuth acceptance tests after deployment.

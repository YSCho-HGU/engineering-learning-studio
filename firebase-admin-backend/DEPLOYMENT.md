# Google account sign-in + Firebase Functions + GitHub App

## Deployment state

**Code is implemented but intentionally NOT activated.** `admin/firebase-config.js` has `enabled:false`, so the existing GitHub-token administrator remains usable until the required Firebase project and GitHub App are provisioned. No passwords, private keys or Firebase Admin credentials belong in the repository. The student-facing GitHub Pages sites remain unchanged.

### Target

- **Frontend:** `https://yscho-hgu.github.io/engineering-learning-studio/admin/` (GitHub Pages).
- **Google Sign-In:** Firebase Authentication with Google provider.
- **Only administrator:** `yscho@handong.edu`, and a specifically enrolled Firebase user UID.
- **Write API:** Firebase Functions v2 HTTPS endpoint, server verifies `verifyIdToken(..., true)` and the exact UID, verified email, Google sign-in provider and linked Google identity.
- **GitHub access:** short-lived GitHub App *installation* token created on the server; install on `YSCho-HGU/engineering-learning-studio` and `YSCho-HGU/signals-systems-visual-lab`.
- **Editable files ONLY:** `c-programming/course-catalog.json` and `course-catalog.json` respectively. No repository/path can be supplied by the browser.

## Provisioning checklist

1. **Create or select a Firebase project** under the intended administrative account. Enable Billing if required for Cloud Functions v2, create a Firebase Web app, and register its public Web config. Enable **Authentication → Sign-in method → Google**. Under Authentication authorized domains, register `yscho-hgu.github.io` (not a full URL or path); use the correct authorized OAuth consent settings for the university account.
2. **Enroll `yscho@handong.edu`** by signing in once with the app once basic Firebase web configuration is available, or with a temporary local sign-in utility. Find the resulting Firebase Authentication UID in Firebase Console. Enter **that exact UID** as the protected `ADMIN_FIREBASE_UID` secret. Do not copy the Google password into configuration. The UID is not the email or Google OAuth client ID.
3. **Create a GitHub App** owned by an account permitted to access both repositories, with the minimum **Repository permissions → Contents: Read & write; Metadata: Read**. No webhook subscriptions or user authorization permissions are needed for this integration. Install it on **only those two repositories**, generate one private key, and note the numeric App ID and Installation ID. If GitHub offers separate installations for the repositories, install under a common owner/installation or adjust the backend to use per-repository installation IDs. Never commit the PEM key.
4. From a trusted development machine, install Firebase CLI and authenticate to the intended Firebase project. Set the four Functions secrets using the CLI; **enter values interactively**:
   ```sh
   cd firebase-admin-backend
   firebase use --add
   firebase functions:secrets:set ADMIN_FIREBASE_UID
   firebase functions:secrets:set GITHUB_APP_ID
   firebase functions:secrets:set GITHUB_INSTALLATION_ID
   firebase functions:secrets:set GITHUB_APP_PRIVATE_KEY
   ```
   For the PEM key, copy the full private key including BEGIN/END headers and line breaks. Prefer a protected file/secret-manager input method that avoids command-line history, and verify multiline handling. If the CLI cannot handle your multiline key input, use Google Cloud Secret Manager with appropriate service account permissions.
5. Deploy the Cloud Functions API:
   ```sh
   cd firebase-admin-backend
   cd functions
   npm install
   npm test
   cd ..
   firebase deploy --only functions:studio-admin:adminCatalog
   ```
   The Functions v2 runtime is Node.js 22 in `asia-northeast3`. Firebase CLI will show the exact **HTTPS API URL**.
6. Verify backend access before enabling frontend: unauthenticated requests from the allowed origin must return **401**; a different verified Google user must return **403**; authorized GET on `?course=c` and `?course=ss` must return catalog data and SHA. Unauthorized `PUT`, unexpected path, extra object properties, stale SHA and nonexistent page publishing attempts must fail. Do not publicly publish the ID token while testing.
7. Edit `admin/firebase-config.js` to set `enabled:true`, `apiUrl` to the deployed HTTPS endpoint, and `firebase` to the **public Firebase Web app configuration** (apiKey, authDomain, projectId, appId). Deploy GitHub Pages. This activates Google login and hides the legacy GitHub-token controls. **There is no client-side token fallback in enabled mode.** Test with both an allowed and disallowed Google account.
8. Revoke any previously circulated GitHub personal access tokens and confirm the administrator page no longer offers token input once activated. Review Firebase Auth sessions, GitHub App installation scope, and server audit logs periodically.

## Request contract

Frontend sends a Firebase user ID token using `Authorization: Bearer <token>`; this token is never stored as a persistent application credential.

- `GET <API_URL>?course=c|ss` returns `{ catalog, sha, course }`.
- `PUT <API_URL>?course=c|ss`, JSON body `{ sha, catalog }`, returns `{ catalog, sha, changed, commit }`.
- **409** = catalog SHA conflict, reload before saving.
- **403** = unapproved account or disallowed browser origin.
- **401** = expired or missing login; sign in again.
- **400** = unauthorized metadata change, malformed request, missing published page.

CORS is restricted to `https://yscho-hgu.github.io`. The backend independently verifies Firebase identity and does **not** rely on CORS or hidden HTML controls for access security. Only published flags, titles, description, book links, and S&S subtitles can be modified; unit IDs/order, group/URL, catalog schema, and other metadata cannot be changed.

## Regression tests and verification

Run from the repository root:

```sh
node --test firebase-admin-backend/functions/tests/*.test.mjs
node --check firebase-admin-backend/functions/index.mjs
node --check admin/admin.js
node --check admin/firebase-auth.js
python3 -m http.server 8765 --bind 127.0.0.1 &
node tests/studio-admin.mjs
node tests/studio-admin-firebase.mjs
```

- `studio-admin.mjs`: legacy mode remains available while Firebase config disabled.
- `studio-admin-firebase.mjs`: mock authorized login, direct GitHub-token path blocked, server GET/PUT, course switching, logout. Mocked tests are **not** proof of a live Firebase project or installed GitHub App.
- Backend unit tests check verified email + UID + linked Google identity, exact repository paths, catalog immutable fields, malformed input and publication path validation.

## Security and operations

- A published **Firebase Web apiKey is not a secret**; the **GitHub App private key, UID policy and service credentials must only reside in Secret Manager**.
- Minimum GitHub App permissions and narrow installation scope reduce exposure; rotate the App key periodically.
- Configure billing budgets, API abuse protection, Cloud Logging retention and Google account 2FA.
- Non-admin students can still access the public student site; `published:false` only hides a lesson from the menu and does **not** make a GitHub Pages HTML URL private.
- For future assistants/editors, replace the single owner UID check with a server-maintained role ACL; do not trust an email suffix such as `@handong.edu` alone.

**Activation is blocked until the Firebase project, Authentication provider, GitHub App installation and four runtime secrets are provided by the administrator.** Do not enable the frontend flag before those steps.

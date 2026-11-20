// Config is public metadata, never put GitHub OAuth/App secrets here.
// Enable only after the Cloudflare Worker and GitHub App OAuth are live.
// Existing token administration continues until enabled.
window.STUDIO_ADMIN_GITHUB=Object.freeze({
 enabled:false,
 workerUrl:""
});

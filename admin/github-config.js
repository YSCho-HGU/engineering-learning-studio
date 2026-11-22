// Config is public metadata, never put GitHub OAuth/App secrets here.
// Enable only after the Cloudflare Worker and GitHub App OAuth are live.
// Fail closed until the real Worker and GitHub App are deployed and verified.
// Browser-based GitHub PAT administration is permanently disabled.
window.STUDIO_ADMIN_GITHUB=Object.freeze({
 enabled:false,
 workerUrl:""
});

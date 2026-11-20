/* Firebase console config is public metadata; never put service-account or GitHub App keys here.
 * After backend setup, set enabled true, fill all Firebase web config fields and API URL.
 * This feature flag preserves the existing token editor until the secure API is ready.
 */
window.STUDIO_ADMIN_FIREBASE_CONFIG=Object.freeze({
 enabled:false,
 apiUrl:"",
 firebase:{
  apiKey:"",authDomain:"",projectId:"",appId:""
 }
});

/* Engineering Learning Studio shared immutable bilingual content model v1.0.0.
 * Only instructional prose is localized. Code, numeric data, response indices
 * and student work are preserved. No localStorage mutations.
 */
(function (root) {
  "use strict";
  if (root.ELSContentModel) return;
  var MODES = ["en", "ko", "mixed"];
  var LOCKED = /^(?:code|source|starter|starterCode|expectedOutput|output|correct|answer|id|slug|kind|minutes|contentRevision|value|defaultValue|phaseBreaks)$/;
  function mode(value) { return MODES.indexOf(value) >= 0 ? value : "mixed"; }
  function bilingual(en, ko, selected) {
    var lang = mode(selected);
    if (lang === "en") return en == null ? "" : String(en);
    if (lang === "ko") return ko == null ? "" : String(ko);
    if (en == null || en === "") return ko == null ? "" : String(ko);
    if (ko == null || ko === "" || en === ko) return String(en);
    return String(en) + "\n" + String(ko);
  }
  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
      var copy = {};
      Object.keys(value).forEach(function (k) { copy[k] = clone(value[k]); });
      return copy;
    }
    return value;
  }
  function project(canonical, overlay, selected) {
    var lang = mode(selected);
    if (Array.isArray(canonical)) return canonical.map(function (item, i) {
      return project(item, Array.isArray(overlay) ? overlay[i] : undefined, lang);
    });
    if (canonical && typeof canonical === "object") {
      var result = {};
      Object.keys(canonical).forEach(function (k) {
        var original = canonical[k];
        var translated = overlay && Object.prototype.hasOwnProperty.call(overlay, k) ? overlay[k] : undefined;
        result[k] = LOCKED.test(k) ? clone(original) : project(original, translated, lang);
      });
      return result;
    }
    if (typeof canonical === "string" && typeof overlay === "string") return bilingual(overlay, canonical, lang);
    return canonical;
  }
  function readText(block, selected) {
    if (typeof block === "string") return block;
    if (!block || typeof block !== "object") return "";
    return bilingual(block.en, block.ko, selected);
  }
  function validate(base, english, prefix) {
    var missing = [], rootPath = prefix || "";
    function visit(a, b, path) {
      if (Array.isArray(a)) { a.forEach(function (x, i) { visit(x, b && b[i], path + "[" + i + "]"); }); return; }
      if (a && typeof a === "object") { Object.keys(a).forEach(function (k) {
        if (!LOCKED.test(k)) visit(a[k], b && b[k], path ? path + "." + k : k);
      }); return; }
      if (typeof a === "string" && /[가-힣]/.test(a) && (typeof b !== "string" || /[가-힣]/.test(b)))
        missing.push(path);
    }
    visit(base, english, rootPath);
    return missing;
  }
  root.ELSContentModel = Object.freeze({
    version: "1.0.0", bilingual: bilingual, project: project,
    readText: readText, validate: validate, clone: clone
  });
})(window);

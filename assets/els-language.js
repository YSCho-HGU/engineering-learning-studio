/* Engineering Learning Studio language preference contract v1.0.
 * ES5-compatible browser script, no dependencies, no automatic page reload.
 * Shared by same-origin GitHub Pages projects: els-language.
 * The caller controls the actual content and any state-preserving rerender.
 */
(function (window, document) {
  "use strict";
  if (window.ELSLanguage && window.ELSLanguage.version === "1.0.0") return;

  var KEY = "els-language";
  var MODES = ["mixed", "en", "ko"];
  var DEFAULT = "mixed";
  var listeners = [];
  var mode = read() || DEFAULT;

  function valid(value) { return MODES.indexOf(value) !== -1; }
  function read() {
    try {
      var value = window.localStorage.getItem(KEY);
      return valid(value) ? value : null;
    } catch (_) { return null; }
  }
  function write(value) {
    try { window.localStorage.setItem(KEY, value); return true; }
    catch (_) { return false; }
  }
  function notify(source) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](mode, { source: source }); } catch (error) {
        window.setTimeout(function () { throw error; }, 0);
      }
    }
    try {
      document.dispatchEvent(new CustomEvent("els-language-change", { detail: { lang: mode, source: source } }));
    } catch (_) {}
  }
  function apply(value, source, persist) {
    if (!valid(value)) return false;
    if (persist) write(value);
    if (value === mode) return true;
    mode = value;
    document.documentElement.lang = mode === "en" ? "en" : "ko";
    document.documentElement.dataset.elsLanguage = mode;
    notify(source);
    return true;
  }
  function get() { return mode; }
  function set(value) { return apply(value, "local", true); }
  function subscribe(fn, immediate) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    if (immediate) fn(mode, { source: "initial" });
    return function () {
      var index = listeners.indexOf(fn);
      if (index >= 0) listeners.splice(index, 1);
    };
  }
  function bindSelect(select) {
    if (typeof select === "string") select = document.querySelector(select);
    if (!select) return function () {};
    select.value = mode;
    var onChange = function () { set(select.value); };
    var unsubscribe = subscribe(function (next) { if (select.value !== next) select.value = next; });
    select.addEventListener("change", onChange);
    return function () { select.removeEventListener("change", onChange); unsubscribe(); };
  }
  function pick(content) {
    if (!content) return "";
    if (typeof content === "string") return content;
    return content[mode] != null ? content[mode] :
      (mode === "mixed" ? (content.en != null ? content.en : content.ko) :
      (content.en != null ? content.en : content.ko)) || "";
  }
  window.addEventListener("storage", function (event) {
    if (event.key === KEY && valid(event.newValue)) apply(event.newValue, "storage", false);
  });
  window.addEventListener("pageshow", function () {
    var saved = read();
    if (saved && saved !== mode) apply(saved, "pageshow", false);
  });
  document.documentElement.dataset.elsLanguage = mode;
  document.documentElement.lang = mode === "en" ? "en" : "ko";
  // Shared bilingual content contract (C, Signals & Systems, future courses).
  // Content is projected from immutable originals, never from the last render.
  function textVariant(en, ko, chosen) {
    if (chosen === "en") return en == null ? "" : en;
    if (chosen === "ko") return ko == null ? "" : ko;
    if (en == null || en === "") return ko == null ? "" : ko;
    if (ko == null || ko === "" || en === ko) return en;
    return String(en) + "\\n" + String(ko);
  }
  function content(entry, chosen) {
    var target = valid(chosen) ? chosen : mode;
    if (entry == null || typeof entry === "string") return entry == null ? "" : entry;
    return textVariant(entry.en, entry.ko, target);
  }
  function project(base, localized, chosen) {
    var target = valid(chosen) ? chosen : mode;
    if (!base || typeof base !== "object") return base;
    if (Array.isArray(base)) return base.map(function(item, i) {
      return project(item, Array.isArray(localized) ? localized[i] : null, target);
    });
    var output = {};
    Object.keys(base).forEach(function(key) {
      var value = base[key];
      var translated = localized && Object.prototype.hasOwnProperty.call(localized, key) ? localized[key] : undefined;
      if (typeof value === "string" && typeof translated === "string") {
        output[key] = textVariant(translated, value, target);
      } else if (value && typeof value === "object") {
        output[key] = project(value, translated, target);
      } else {
        output[key] = value;
      }
    });
    return output;
  }
  window.ELSLanguage = Object.freeze({
    version: "1.0.0", key: KEY, modes: MODES.slice(), get: get, set: set,
    subscribe: subscribe, bindSelect: bindSelect, pick: pick, content: content, project: project
  });
})(window, document);

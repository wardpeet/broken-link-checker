"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("../internal/events");
var _Link = require("../internal/Link");
var _linkTypes = require("link-types");
var _parseHTML = _interopRequireDefault(require("../internal/parseHTML"));
var _parseOptions = _interopRequireDefault(require("../internal/parseOptions"));
var _robotDirectives = _interopRequireWildcard(require("robot-directives"));
var _SafeEventEmitter = _interopRequireDefault(require("../internal/SafeEventEmitter"));
var _scrapeHTML = _interopRequireDefault(require("../internal/scrapeHTML"));
var _httpProtocol = require("../internal/http-protocol");
var _UrlChecker = _interopRequireDefault(require("./UrlChecker"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _auth = /*#__PURE__*/new WeakMap();
var _excludedLinks = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _resolvePromise = /*#__PURE__*/new WeakMap();
var _robots = /*#__PURE__*/new WeakMap();
var _scanning = /*#__PURE__*/new WeakMap();
var _urlChecker = /*#__PURE__*/new WeakMap();
var _HtmlChecker_brand = /*#__PURE__*/new WeakSet();
class HtmlChecker extends _SafeEventEmitter.default {
  constructor(options) {
    super();
    _classPrivateMethodInitSpec(this, _HtmlChecker_brand);
    _classPrivateFieldInitSpec(this, _auth, void 0);
    _classPrivateFieldInitSpec(this, _excludedLinks, void 0);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldInitSpec(this, _resolvePromise, void 0);
    _classPrivateFieldInitSpec(this, _robots, void 0);
    _classPrivateFieldInitSpec(this, _scanning, void 0);
    _classPrivateFieldInitSpec(this, _urlChecker, void 0);
    _classPrivateFieldSet(_options, this, (0, _parseOptions.default)(options));
    _assertClassBrand(_HtmlChecker_brand, this, _reset).call(this);
    _classPrivateFieldSet(_urlChecker, this, new _UrlChecker.default(_classPrivateFieldGet(_options, this)).on(_events.ERROR_EVENT, error => this.emit(_events.ERROR_EVENT, error)).on(_events.QUEUE_EVENT, () => this.emit(_events.QUEUE_EVENT)).on(_events.JUNK_EVENT, result => {
      var _this$excludedLinks, _this$excludedLinks2;
      result.set(_Link.HTML_OFFSET_INDEX, (_classPrivateFieldSet(_excludedLinks, this, (_this$excludedLinks = _classPrivateFieldGet(_excludedLinks, this), _this$excludedLinks2 = _this$excludedLinks++, _this$excludedLinks)), _this$excludedLinks2));
      this.emit(_events.JUNK_EVENT, result);
    }).on(_events.LINK_EVENT, result => this.emit(_events.LINK_EVENT, result)).on(_events.END_EVENT, () => _assertClassBrand(_HtmlChecker_brand, this, _complete).call(this)));
  }
  clearCache() {
    _classPrivateFieldGet(_urlChecker, this).clearCache();
    return this;
  }
  get isPaused() {
    return _classPrivateFieldGet(_urlChecker, this).isPaused;
  }

  /**
   * Enqueue a Link if it is valid and passes filters.
   * @param {Link} link
   */

  get numActiveLinks() {
    return _classPrivateFieldGet(_urlChecker, this).numActiveLinks;
  }
  get numQueuedLinks() {
    return _classPrivateFieldGet(_urlChecker, this).numQueuedLinks;
  }
  pause() {
    _classPrivateFieldGet(_urlChecker, this).pause();
    return this;
  }
  resume() {
    _classPrivateFieldGet(_urlChecker, this).resume();
    return this;
  }

  // `robots` and `auth` are undocumented and for internal use only
  async scan(html, baseURL, robots, auth) {
    if (_classPrivateFieldGet(_scanning, this)) {
      // @todo use custom error (for better tests and consumer debugging) ?
      throw new Error("Scan already in progress");
    } else {
      // Prevent user error with missing undocumented arugment
      if (!(robots instanceof _robotDirectives.default)) {
        robots = new _robotDirectives.default({
          userAgent: _classPrivateFieldGet(_options, this).userAgent
        });
      }
      const transitive = (0, _httpProtocol.transitiveAuth)(baseURL, auth);
      baseURL = transitive.url; // @todo remove hash (and store somewhere?)

      _classPrivateFieldSet(_auth, this, transitive.auth);
      _classPrivateFieldSet(_robots, this, robots);
      _classPrivateFieldSet(_scanning, this, true);
      const document = await (0, _parseHTML.default)(html);
      const links = (0, _scrapeHTML.default)(document, baseURL, _classPrivateFieldGet(_robots, this)); // @todo add auth?

      this.emit(_events.HTML_EVENT, document, _classPrivateFieldGet(_robots, this));
      links.forEach(link => _assertClassBrand(_HtmlChecker_brand, this, _maybeEnqueueLink).call(this, link));
      const resolveOnComplete = new Promise(resolve => _classPrivateFieldSet(_resolvePromise, this, resolve));

      // If no links found or all links already checked
      if (_classPrivateFieldGet(_urlChecker, this).numActiveLinks === 0 && _classPrivateFieldGet(_urlChecker, this).numQueuedLinks === 0) {
        _assertClassBrand(_HtmlChecker_brand, this, _complete).call(this);
      }
      return resolveOnComplete;
    }
  }
  get __cache() {
    return _classPrivateFieldGet(_urlChecker, this).__cache;
  }
}

//::: PRIVATE FUNCTIONS
exports.default = HtmlChecker;
function _complete() {
  const resolvePromise = _classPrivateFieldGet(_resolvePromise, this);
  _assertClassBrand(_HtmlChecker_brand, this, _reset).call(this);
  this.emit(_events.COMPLETE_EVENT);
  resolvePromise();
}
/**
 * Determine whether a Link should be excluded from checks, and the reason for such.
 * @param {Link} link
 * @returns {string|undefined}
 */
function _getExcludeReason(link) {
  const attrName = link.get(_Link.HTML_ATTR_NAME);
  const attrs = link.get(_Link.HTML_ATTRS);
  const isInternal = link.get(_Link.IS_INTERNAL);
  const tagName = link.get(_Link.HTML_TAG_NAME);
  const {
    excludeExternalLinks,
    excludeInternalLinks,
    excludeLinksToSamePage,
    honorRobotExclusions
  } = _classPrivateFieldGet(_options, this);
  if (honorRobotExclusions && _classPrivateFieldGet(_robots, this).oneIs([_robotDirectives.NOFOLLOW, _robotDirectives.NOINDEX])) {
    return "BLC_ROBOTS";
  } else if (honorRobotExclusions && _classPrivateFieldGet(_robots, this).is(_robotDirectives.NOIMAGEINDEX) && isRobotAttr(tagName, attrName)) {
    return "BLC_ROBOTS";
  } else if (honorRobotExclusions && (attrs === null || attrs === void 0 ? void 0 : attrs.rel) != null && (0, _linkTypes.map)(attrs.rel).nofollow) {
    return "BLC_ROBOTS";
  } else if (_assertClassBrand(_HtmlChecker_brand, this, _isExcludedAttribute).call(this, attrName, [tagName, "*"])) {
    return "BLC_HTML";
  } else if (excludeExternalLinks && isInternal === false) {
    return "BLC_EXTERNAL";
  } else if (excludeInternalLinks && isInternal) {
    return "BLC_INTERNAL";
  } else if (excludeLinksToSamePage && link.get(_Link.IS_SAME_PAGE)) {
    return "BLC_SAMEPAGE";
  }
}
/**
 * Determine whether a Link's HTML element and attribute would cause it to be excluded from checks.
 * @param {string} attrName
 * @param {Array<string>} tagNames
 * @returns {boolean}
 */
function _isExcludedAttribute(attrName, tagNames) {
  const tagGroups = _classPrivateFieldGet(_options, this).tags[_classPrivateFieldGet(_options, this).filterLevel];
  return tagNames.every(tagName => !(tagName in tagGroups) || !(attrName in tagGroups[tagName]));
}
function _maybeEnqueueLink(link) {
  if (link.get(_Link.REBASED_URL) === null) {
    link.set(_Link.HTML_OFFSET_INDEX, link.get(_Link.HTML_INDEX) - _classPrivateFieldGet(_excludedLinks, this));
    link.break("BLC_INVALID");

    // Can't enqueue a non-URL
    this.emit(_events.LINK_EVENT, link);
  } else {
    const excludedReason = _assertClassBrand(_HtmlChecker_brand, this, _getExcludeReason).call(this, link);
    if (excludedReason === undefined) {
      link.set(_Link.HTML_OFFSET_INDEX, link.get(_Link.HTML_INDEX) - _classPrivateFieldGet(_excludedLinks, this));
      _classPrivateFieldGet(_urlChecker, this).enqueue(link, null, _classPrivateFieldGet(_auth, this));
    } else {
      var _this$excludedLinks3, _this$excludedLinks4;
      link.set(_Link.HTML_OFFSET_INDEX, (_classPrivateFieldSet(_excludedLinks, this, (_this$excludedLinks3 = _classPrivateFieldGet(_excludedLinks, this), _this$excludedLinks4 = _this$excludedLinks3++, _this$excludedLinks3)), _this$excludedLinks4));
      link.exclude(excludedReason);
      this.emit(_events.JUNK_EVENT, link);
    }
  }
}
function _reset() {
  _classPrivateFieldSet(_auth, this, null);
  _classPrivateFieldSet(_excludedLinks, this, 0);
  _classPrivateFieldSet(_resolvePromise, this, null);
  _classPrivateFieldSet(_robots, this, null);
  _classPrivateFieldSet(_scanning, this, false);
}
const isRobotAttr = (tagName, attrName) => {
  return tagName === "img" && attrName === "src" || tagName === "input" && attrName === "src" || tagName === "menuitem" && attrName === "icon" || tagName === "video" && attrName === "poster";
};
module.exports = exports.default;
//# sourceMappingURL=HtmlChecker.js.map
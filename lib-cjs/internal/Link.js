"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WAS_EXCLUDED = exports.RESOLVED_URL = exports.RESOLVED_BASE_URL = exports.REDIRECTED_URL = exports.REBASED_URL = exports.REBASED_BASE_URL = exports.ORIGINAL_URL = exports.IS_SAME_PAGE = exports.IS_INTERNAL = exports.IS_BROKEN = exports.HTTP_RESPONSE_WAS_CACHED = exports.HTTP_RESPONSE = exports.HTML_TEXT = exports.HTML_TAG_NAME = exports.HTML_TAG = exports.HTML_SELECTOR = exports.HTML_OFFSET_INDEX = exports.HTML_LOCATION = exports.HTML_INDEX = exports.HTML_BASE_HREF = exports.HTML_ATTR_NAME = exports.HTML_ATTRS = exports.EXCLUDED_REASON = exports.BROKEN_REASON = void 0;
var reasons = _interopRequireWildcard(require("./reasons"));
var _isurl = _interopRequireDefault(require("isurl"));
var _urlRelation = _interopRequireDefault(require("url-relation"));
var _Link;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
const ORIGINAL_URL = exports.ORIGINAL_URL = "originalURL"; // The URL string as it was inputted
const RESOLVED_URL = exports.RESOLVED_URL = "resolvedURL"; // The `URL`, resolved with `RESOLVED_BASE_URL`
const REBASED_URL = exports.REBASED_URL = "rebasedURL"; // The `URL`, resolved with `REBASED_BASE_URL`
const REDIRECTED_URL = exports.REDIRECTED_URL = "redirectedURL"; // The `URL`, after its last redirection, if any

const RESOLVED_BASE_URL = exports.RESOLVED_BASE_URL = "resolvedBaseURL"; // The base `URL`
const REBASED_BASE_URL = exports.REBASED_BASE_URL = "rebasedBaseURL"; // The base `URL`, resolved with `HTML_BASE_HREF`

const HTML_INDEX = exports.HTML_INDEX = "htmlIndex"; // The order in which the link appeared in its document -- out of all links using max-level tag filter
const HTML_OFFSET_INDEX = exports.HTML_OFFSET_INDEX = "htmlOffsetIndex"; // Sequential (gap-free) indices for skipped and unskipped links
const HTML_LOCATION = exports.HTML_LOCATION = "htmlLocation"; // Source code location of the attribute that the link was found within
const HTML_SELECTOR = exports.HTML_SELECTOR = "htmlSelector"; // CSS selector for element in document
const HTML_TAG_NAME = exports.HTML_TAG_NAME = "htmlTagName"; // Tag name that the link was found on
const HTML_ATTR_NAME = exports.HTML_ATTR_NAME = "htmlAttrName"; // Attribute name that the link was found within
const HTML_ATTRS = exports.HTML_ATTRS = "htmlAttrs"; // All attributes on the element
const HTML_TEXT = exports.HTML_TEXT = "htmlText"; // TextNodes/innerText of the element
const HTML_TAG = exports.HTML_TAG = "htmlTag"; // The entire tag string
const HTML_BASE_HREF = exports.HTML_BASE_HREF = "htmlBaseHref"; // The document's `<base href>` value

const HTTP_RESPONSE = exports.HTTP_RESPONSE = "httpResponse"; // The request response
const HTTP_RESPONSE_WAS_CACHED = exports.HTTP_RESPONSE_WAS_CACHED = "httpResponseWasCached"; // If the response was from cache

const IS_BROKEN = exports.IS_BROKEN = "isBroken"; // If the link was determined to be broken or not
const IS_INTERNAL = exports.IS_INTERNAL = "isInternal"; // If the link is to the same host as its base/document
const IS_SAME_PAGE = exports.IS_SAME_PAGE = "isSamePage"; // If the link is to the same page as its base/document
const WAS_EXCLUDED = exports.WAS_EXCLUDED = "wasExcluded"; // If the link was excluded due to any filtering

const BROKEN_REASON = exports.BROKEN_REASON = "brokenReason"; // The reason why the link was considered broken, if it indeed is
const EXCLUDED_REASON = exports.EXCLUDED_REASON = "excludedReason"; // The reason why the link was excluded from being checked, if it indeed was
var _Link_brand = /*#__PURE__*/new WeakSet();
class Link extends Map {
  /**
   * @param {Link} [link]
   */
  constructor(link) {
    super(link);
    /**
     * Reassign properties associated with state relative to the link's environment.
     */
    _classPrivateMethodInitSpec(this, _Link_brand);
    if (!(link instanceof Link)) {
      // Default values
      keys.forEach(key => super.set(key, null));
    }
  }

  /**
   * Change state to "broken" with a reason.
   * @param {string} reasonKey
   * @returns {Link}
   */
  break(reasonKey) {
    if (!(reasonKey in reasons)) {
      reasonKey = "BLC_UNKNOWN";
    }
    super.set(IS_BROKEN, true);
    super.set(BROKEN_REASON, reasonKey);
    this.include();
    return this;
  }

  /**
   * Change state to "excluded" with a reason.
   * @param {string} reasonKey
   * @returns {Link}
   */
  exclude(reasonKey) {
    super.set(WAS_EXCLUDED, true);
    super.set(EXCLUDED_REASON, reasonKey);
    return this;
  }

  /**
   * Change state to "not excluded" and remove any previous reason for being otherwise.
   * @returns {Link}
   */
  include() {
    super.set(WAS_EXCLUDED, false);
    super.set(EXCLUDED_REASON, null);
    return this;
  }

  /**
   * Change state to "not broken" and remove any previous reason for being otherwise.
   * @returns {Link}
   */
  mend() {
    super.set(IS_BROKEN, false);
    super.set(BROKEN_REASON, null);
    this.include();
    return this;
  }

  /**
   * Assign a redirected URL and change any relative state.
   * @param {URL|string} url
   * @returns {Link}
   */
  redirect(url) {
    super.set(REDIRECTED_URL, parseURL(url));
    _assertClassBrand(_Link_brand, this, _relateWithBase).call(this);
    return this;
  }
  /**
   * Produce and assign an absolute URL and change any relative state.
   * @param {URL|string|null} [url]
   * @param {URL|string|null} [base]
   * @returns {Link}
   */
  resolve(url, base) {
    if (url != null) {
      // Parse or clone
      base = parseURL(base);
      if ((0, _isurl.default)(url)) {
        super.set(ORIGINAL_URL, url.href);
        super.set(RESOLVED_URL, url);
      } else {
        super.set(ORIGINAL_URL, url);
        super.set(RESOLVED_URL, parseURL(url));
      }
      if (base !== null) {
        // Remove any hash since it's useless in a base -- safe to mutate
        base.hash = "";
        const rebased = parseURL(super.get(HTML_BASE_HREF), base);
        super.set(REBASED_BASE_URL, rebased ?? base);
        super.set(RESOLVED_BASE_URL, base);
      } else {
        super.set(REBASED_BASE_URL, parseURL(super.get(HTML_BASE_HREF)));
      }
      if (super.get(REBASED_BASE_URL) !== null) {
        // Remove any hash since it's useless in a base -- safe to mutate
        super.get(REBASED_BASE_URL).hash = "";
        if (super.get(RESOLVED_URL) === null) {
          super.set(RESOLVED_URL, parseURL(url, super.get(RESOLVED_BASE_URL)));
          super.set(REBASED_URL, parseURL(url, super.get(REBASED_BASE_URL)));
        } else {
          super.set(REBASED_URL, super.get(RESOLVED_URL));
        }
      } else {
        super.set(REBASED_URL, super.get(RESOLVED_URL));
      }

      // @todo move relation stuff out of this function -- separation of concerns?
      _assertClassBrand(_Link_brand, this, _relateWithBase).call(this);
    }
    return this;
  }

  /**
   * Assign a value to a supported key.
   * @param {symbol} key
   * @param {*} value
   * @throws {TypeError} unsupported key or undefined value
   * @returns {Link}
   */
  set(key, value) {
    if (!keys.includes(key)) {
      throw new TypeError("Invalid key");
    } else if (value === undefined) {
      throw new TypeError("Invalid value");
    } else {
      return super.set(key, value);
    }
  }

  /**
   * Produce a key-value object for `JSON.stringify()`.
   * @returns {object}
   */
  toJSON() {
    // @todo https://github.com/tc39/proposal-pipeline-operator
    return Object.fromEntries(Array.from(super.entries()));
  }
}
exports.default = Link;
_Link = Link;
function _relateWithBase() {
  const url = _superPropGet(_Link.prototype, "get", this, 2)([REDIRECTED_URL]) ?? _superPropGet(_Link.prototype, "get", this, 2)([REBASED_URL]);

  // If impossible to determine is linked to same server/etc
  if (url === null || _superPropGet(_Link.prototype, "get", this, 2)([RESOLVED_BASE_URL]) === null) {
    // Overwrite any previous values
    _superPropGet(_Link.prototype, "set", this, 2)([IS_INTERNAL, null]);
    _superPropGet(_Link.prototype, "set", this, 2)([IS_SAME_PAGE, null]);
  } else {
    // Rebased base URL not used because `<base href>` URL could be remote
    // @todo common/careful profile
    // @todo auth shouldn't affect this
    const relation = new _urlRelation.default(url, _superPropGet(_Link.prototype, "get", this, 2)([RESOLVED_BASE_URL]));
    _superPropGet(_Link.prototype, "set", this, 2)([IS_INTERNAL, relation.upTo(_urlRelation.default.HOST)]);
    _superPropGet(_Link.prototype, "set", this, 2)([IS_SAME_PAGE, relation.upTo(_urlRelation.default.PATH)]);
  }
}
const keys = [BROKEN_REASON, EXCLUDED_REASON, HTML_ATTR_NAME, HTML_ATTRS, HTML_BASE_HREF, HTML_INDEX, HTML_LOCATION, HTML_OFFSET_INDEX, HTML_SELECTOR, HTML_TAG, HTML_TAG_NAME, HTML_TEXT, HTTP_RESPONSE, HTTP_RESPONSE_WAS_CACHED, IS_BROKEN, IS_INTERNAL, IS_SAME_PAGE, ORIGINAL_URL, REBASED_BASE_URL, REBASED_URL, REDIRECTED_URL, RESOLVED_BASE_URL, RESOLVED_URL, WAS_EXCLUDED];

/**
 * Parse or clone a URL.
 * @param {URL|string|null} [url]
 * @param {URL|string|null} [base]
 * @returns {URL|null}
 */
const parseURL = (url = null, base) => {
  if (url !== null) {
    try {
      url = new URL(url, base);
    } catch {
      url = null;
    }
  }
  return url;
};
Object.freeze(Link);
//# sourceMappingURL=Link.js.map
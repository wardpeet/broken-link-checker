"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("../internal/events");
var _Link = require("../internal/Link");
var _httpProtocol = require("../internal/http-protocol");
var _HtmlUrlChecker = _interopRequireDefault(require("./HtmlUrlChecker"));
var _parseOptions = _interopRequireDefault(require("../internal/parseOptions"));
var _limitedRequestQueue = _interopRequireWildcard(require("limited-request-queue"));
var _SafeEventEmitter = _interopRequireDefault(require("../internal/SafeEventEmitter"));
var _urlcache = _interopRequireDefault(require("urlcache"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
// @todo BLC_ROBOTS catches rel=nofollow links but will also catch meta/header excluded links -- fine?
const PAGE_EXCLUSIONS = ["BLC_KEYWORD", "BLC_ROBOTS"];
const PAGE_WAS_CHECKED = true;
var _currentAuth = /*#__PURE__*/new WeakMap();
var _currentCustomData = /*#__PURE__*/new WeakMap();
var _currentDone = /*#__PURE__*/new WeakMap();
var _currentPageError = /*#__PURE__*/new WeakMap();
var _currentRobotsTxt = /*#__PURE__*/new WeakMap();
var _currentSiteURL = /*#__PURE__*/new WeakMap();
var _htmlUrlChecker = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _sitePagesChecked = /*#__PURE__*/new WeakMap();
var _siteUrlQueue = /*#__PURE__*/new WeakMap();
var _SiteChecker_brand = /*#__PURE__*/new WeakSet();
class SiteChecker extends _SafeEventEmitter.default {
  constructor(_options2) {
    super();
    /**
     * Enqueue a URL to be crawled.
     * @param {URL} url
     * @param {*} customData
     * @param {object} auth
     */
    _classPrivateMethodInitSpec(this, _SiteChecker_brand);
    _classPrivateFieldInitSpec(this, _currentAuth, void 0);
    _classPrivateFieldInitSpec(this, _currentCustomData, void 0);
    _classPrivateFieldInitSpec(this, _currentDone, void 0);
    _classPrivateFieldInitSpec(this, _currentPageError, void 0);
    _classPrivateFieldInitSpec(this, _currentRobotsTxt, void 0);
    _classPrivateFieldInitSpec(this, _currentSiteURL, void 0);
    _classPrivateFieldInitSpec(this, _htmlUrlChecker, void 0);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldInitSpec(this, _sitePagesChecked, void 0);
    _classPrivateFieldInitSpec(this, _siteUrlQueue, void 0);
    _classPrivateFieldSet(_options, this, _assertClassBrand(_SiteChecker_brand, this, _overrideOptions).call(this, (0, _parseOptions.default)(_options2))); // @todo https://github.com/tc39/proposal-pipeline-operator
    _classPrivateFieldSet(_sitePagesChecked, this, new _urlcache.default({
      maxAge: _classPrivateFieldGet(_options, this).cacheMaxAge
    }));
    _assertClassBrand(_SiteChecker_brand, this, _reset).call(this);
    _classPrivateFieldSet(_siteUrlQueue, this, new _limitedRequestQueue.default({
      maxSockets: 1,
      rateLimit: _classPrivateFieldGet(_options, this).rateLimit
    }).on(_limitedRequestQueue.ITEM_EVENT, async (url, {
      auth,
      customData
    }, done) => {
      _assertClassBrand(_SiteChecker_brand, this, _reset).call(this);
      _classPrivateFieldSet(_currentAuth, this, auth);
      _classPrivateFieldSet(_currentCustomData, this, customData);
      _classPrivateFieldSet(_currentDone, this, done);
      _classPrivateFieldSet(_currentSiteURL, this, url); // @todo strip after hostname?

      try {
        if ((0, _httpProtocol.isCompatibleScheme)(url) && _classPrivateFieldGet(_options, this).honorRobotExclusions) {
          const robots = await (0, _httpProtocol.getRobotsTxt)(_classPrivateFieldGet(_currentSiteURL, this), _classPrivateFieldGet(_currentAuth, this), this.__cache, _classPrivateFieldGet(_options, this));

          // This receives an instance even if no robots.txt was found
          _classPrivateFieldSet(_currentRobotsTxt, this, robots);
          this.emit(_events.ROBOTS_EVENT, robots, _classPrivateFieldGet(_currentCustomData, this));
        }
      } catch {
        // If could not connect to server -- let `HtmlUrlChecker` catch it
      } finally {
        _assertClassBrand(_SiteChecker_brand, this, _enqueuePage).call(this, _classPrivateFieldGet(_currentSiteURL, this), _classPrivateFieldGet(_currentCustomData, this), _classPrivateFieldGet(_currentAuth, this));
      }
    }).on(_limitedRequestQueue.END_EVENT, () => {
      // Clear references for garbage collection
      _assertClassBrand(_SiteChecker_brand, this, _reset).call(this);
      this.emit(_events.END_EVENT);
    }));
    _classPrivateFieldSet(_htmlUrlChecker, this, new _HtmlUrlChecker.default(_classPrivateFieldGet(_options, this)).on(_events.ERROR_EVENT, error => this.emit(_events.ERROR_EVENT, error)).on(_events.HTML_EVENT, (tree, robots, response, pageURL, customData) => {
      // If was redirected
      if (response.url !== pageURL) {
        _classPrivateFieldGet(_sitePagesChecked, this).set(response.url, PAGE_WAS_CHECKED);

        // Avoid rechecking any redirected pages
        response.redirects.forEach(redirect => _classPrivateFieldGet(_sitePagesChecked, this).set(redirect.url, PAGE_WAS_CHECKED));
      }
      this.emit(_events.HTML_EVENT, tree, robots, response, pageURL, customData);
    }).on(_events.QUEUE_EVENT, () => this.emit(_events.QUEUE_EVENT)).on(_events.JUNK_EVENT, (result, customData) => {
      this.emit(_events.JUNK_EVENT, result, customData);
      _assertClassBrand(_SiteChecker_brand, this, _maybeEnqueuePage).call(this, result, customData, _classPrivateFieldGet(_currentAuth, this));
    }).on(_events.LINK_EVENT, (result, customData) => {
      this.emit(_events.LINK_EVENT, result, customData);
      _assertClassBrand(_SiteChecker_brand, this, _maybeEnqueuePage).call(this, result, customData, _classPrivateFieldGet(_currentAuth, this));
    }).on(_events.PAGE_EVENT, (error, pageURL, customData) => {
      this.emit(_events.PAGE_EVENT, error, pageURL, customData);

      // Only the first page should supply an error to SITE_EVENT
      if (_classPrivateFieldGet(_sitePagesChecked, this).length <= 1) {
        _classPrivateFieldSet(_currentPageError, this, error);
      }
    }).on(_events.END_EVENT, () => {
      this.emit(_events.SITE_EVENT, _classPrivateFieldGet(_currentPageError, this), _classPrivateFieldGet(_currentSiteURL, this), _classPrivateFieldGet(_currentCustomData, this));

      // Auto-starts next site, if any
      // Emits REQUEST_QUEUE_END_EVENT, if not
      _classPrivateFieldGet(_currentDone, this).call(this);
    }));
  }
  clearCache() {
    // Does not clear `sitePagesChecked` because it would mess up any current scans
    _classPrivateFieldGet(_htmlUrlChecker, this).clearCache();
    return this;
  }
  dequeue(id) {
    const success = _classPrivateFieldGet(_siteUrlQueue, this).dequeue(id);
    this.emit(_events.QUEUE_EVENT);
    return success;
  }
  enqueue(firstPageURL, customData) {
    const transitive = (0, _httpProtocol.transitiveAuth)(firstPageURL);
    const success = _classPrivateFieldGet(_siteUrlQueue, this).enqueue(transitive.url, {
      auth: transitive.auth,
      customData
    });
    this.emit(_events.QUEUE_EVENT);
    return success;
  }
  has(id) {
    return _classPrivateFieldGet(_siteUrlQueue, this).has(id);
  }

  /**
   * Determine whether a Link should be included, conforming to any robots filter.
   * @param {Link} link
   * @returns {boolean}
   */

  get isPaused() {
    return _classPrivateFieldGet(_htmlUrlChecker, this).isPaused;
  }

  /**
   * Enqueue a page (to be crawled) if it passes filters.
   * @param {Link} link
   * @param {*} customData
   * @param {object} auth
   */

  get numActiveLinks() {
    return _classPrivateFieldGet(_htmlUrlChecker, this).numActiveLinks;
  }
  get numQueuedLinks() {
    return _classPrivateFieldGet(_htmlUrlChecker, this).numQueuedLinks;
  }
  get numPages() {
    return _classPrivateFieldGet(_htmlUrlChecker, this).numPages;
  }
  get numSites() {
    return _classPrivateFieldGet(_siteUrlQueue, this).length;
  }

  /**
   * Override/mutate some options for extended behavior.
   * @param {object} options
   * @returns {object}
   */

  pause() {
    _classPrivateFieldGet(_htmlUrlChecker, this).pause();
    _classPrivateFieldGet(_siteUrlQueue, this).pause();
    return this;
  }
  resume() {
    _classPrivateFieldGet(_htmlUrlChecker, this).resume();
    _classPrivateFieldGet(_siteUrlQueue, this).resume();
    return this;
  }

  // Useless, but consistent with other classes
  get __cache() {
    return _classPrivateFieldGet(_htmlUrlChecker, this).__cache;
  }
}
exports.default = SiteChecker;
function _enqueuePage(url, customData, auth) {
  // Avoid links to self within page
  _classPrivateFieldGet(_sitePagesChecked, this).set(url, PAGE_WAS_CHECKED);
  _classPrivateFieldGet(_htmlUrlChecker, this).enqueue(url, customData, auth);
}
/**
 * Determine whether a Link should be excluded from checks, and the reason for such.
 * @param {Link} link
 * @returns {string|undefined}
 */
function _getExcludedReason(link) {
  if (link.get(_Link.IS_INTERNAL) && !_assertClassBrand(_SiteChecker_brand, this, _isAllowed).call(this, link)) {
    return "BLC_ROBOTS";
  } else {
    // Not excluded
  }
}
function _isAllowed(link) {
  if (_classPrivateFieldGet(_options, this).honorRobotExclusions) {
    var _link$get;
    const rebasedPathname = (_link$get = link.get(_Link.REBASED_URL)) === null || _link$get === void 0 ? void 0 : _link$get.pathname;

    // @todo remove condition when/if `Link::invalidate()` is used in `HtmlChecker`
    if (rebasedPathname !== null) {
      return _classPrivateFieldGet(_currentRobotsTxt, this).isAllowed(_classPrivateFieldGet(_options, this).userAgent, rebasedPathname);
    } else {
      return true;
    }
  } else {
    return true;
  }
}
function _maybeEnqueuePage(link, customData, auth) {
  // Skip specific links that were excluded from checks
  if (link.get(_Link.WAS_EXCLUDED) && PAGE_EXCLUSIONS.includes(link.get(_Link.EXCLUDED_REASON))) {
    // do nothing
  } else {
    const tagGroup = _classPrivateFieldGet(_options, this).tags.recursive[_classPrivateFieldGet(_options, this).filterLevel][link.get(_Link.HTML_TAG_NAME)] ?? {};
    const attrSupported = link.get(_Link.HTML_ATTR_NAME) in tagGroup;
    const rebasedURL = link.get(_Link.REBASED_URL);
    const redirectedURL = link.get(_Link.REDIRECTED_URL);
    if (!attrSupported || link.get(_Link.IS_BROKEN) || !link.get(_Link.IS_INTERNAL) || _classPrivateFieldGet(_sitePagesChecked, this).has(rebasedURL) || !_assertClassBrand(_SiteChecker_brand, this, _isAllowed).call(this, link)) {
      // do nothing
    } else if (redirectedURL !== null) {
      // Because only the final redirected page needs to be [recursively] checked,
      // all redirects are stored as pages that have been checked
      link.get(_Link.HTTP_RESPONSE).redirects.forEach(({
        url
      }) => _classPrivateFieldGet(_sitePagesChecked, this).set(url, PAGE_WAS_CHECKED));
      if (!_classPrivateFieldGet(_sitePagesChecked, this).has(redirectedURL)) {
        _assertClassBrand(_SiteChecker_brand, this, _enqueuePage).call(this, redirectedURL, customData, auth);
      }
    } else if (_classPrivateFieldGet(_options, this).includePage(rebasedURL)) {
      _assertClassBrand(_SiteChecker_brand, this, _enqueuePage).call(this, rebasedURL, customData, auth);
    }
  }
}
function _overrideOptions(options) {
  const {
    includeLink
  } = options;
  options.includeLink = link => {
    const excludedReason = _assertClassBrand(_SiteChecker_brand, this, _getExcludedReason).call(this, link);
    if (excludedReason === undefined) {
      return includeLink(link);
    } else {
      // Undocumented return value type
      return excludedReason;
    }
  };
  return options;
}
function _reset() {
  _classPrivateFieldSet(_currentAuth, this, null);
  _classPrivateFieldSet(_currentCustomData, this, null);
  _classPrivateFieldSet(_currentDone, this, null);
  _classPrivateFieldSet(_currentPageError, this, null);
  _classPrivateFieldSet(_currentRobotsTxt, this, null);
  _classPrivateFieldSet(_currentSiteURL, this, null);
  _classPrivateFieldGet(_sitePagesChecked, this).clear();
}
module.exports = exports.default;
//# sourceMappingURL=SiteChecker.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("../internal/events");
var _HtmlChecker = _interopRequireDefault(require("./HtmlChecker"));
var _parseOptions = _interopRequireDefault(require("../internal/parseOptions"));
var _limitedRequestQueue = _interopRequireWildcard(require("limited-request-queue"));
var _robotDirectives = _interopRequireDefault(require("robot-directives"));
var _SafeEventEmitter = _interopRequireDefault(require("../internal/SafeEventEmitter"));
var _streamHTML = _interopRequireDefault(require("../internal/streamHTML"));
var _httpProtocol = require("../internal/http-protocol");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _currentAuth = /*#__PURE__*/new WeakMap();
var _currentCustomData = /*#__PURE__*/new WeakMap();
var _currentDone = /*#__PURE__*/new WeakMap();
var _currentPageURL = /*#__PURE__*/new WeakMap();
var _currentResponse = /*#__PURE__*/new WeakMap();
var _currentRobots = /*#__PURE__*/new WeakMap();
var _htmlChecker = /*#__PURE__*/new WeakMap();
var _htmlUrlQueue = /*#__PURE__*/new WeakMap();
var _options = /*#__PURE__*/new WeakMap();
var _HtmlUrlChecker_brand = /*#__PURE__*/new WeakSet();
class HtmlUrlChecker extends _SafeEventEmitter.default {
  constructor(options) {
    super();
    /**
     * Append any robot headers.
     */
    _classPrivateMethodInitSpec(this, _HtmlUrlChecker_brand);
    _classPrivateFieldInitSpec(this, _currentAuth, void 0);
    _classPrivateFieldInitSpec(this, _currentCustomData, void 0);
    _classPrivateFieldInitSpec(this, _currentDone, void 0);
    _classPrivateFieldInitSpec(this, _currentPageURL, void 0);
    _classPrivateFieldInitSpec(this, _currentResponse, void 0);
    _classPrivateFieldInitSpec(this, _currentRobots, void 0);
    _classPrivateFieldInitSpec(this, _htmlChecker, void 0);
    _classPrivateFieldInitSpec(this, _htmlUrlQueue, void 0);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _assertClassBrand(_HtmlUrlChecker_brand, this, _reset).call(this);
    _classPrivateFieldSet(_options, this, (0, _parseOptions.default)(options));
    _classPrivateFieldSet(_htmlUrlQueue, this, new _limitedRequestQueue.default({
      maxSockets: 1,
      rateLimit: _classPrivateFieldGet(_options, this).rateLimit
    }).on(_limitedRequestQueue.ITEM_EVENT, async (url, {
      auth,
      customData
    }, done) => {
      _assertClassBrand(_HtmlUrlChecker_brand, this, _reset).call(this);
      _classPrivateFieldSet(_currentAuth, this, auth);
      _classPrivateFieldSet(_currentCustomData, this, customData);
      _classPrivateFieldSet(_currentDone, this, done);
      _classPrivateFieldSet(_currentPageURL, this, url); // @todo remove hash ?

      try {
        const {
          response,
          stream
        } = await (0, _streamHTML.default)(_classPrivateFieldGet(_currentPageURL, this), _classPrivateFieldGet(_currentAuth, this), this.__cache, _classPrivateFieldGet(_options, this));

        // Is only defined for HTTP -- made null for consistency
        _classPrivateFieldSet(_currentResponse, this, response ?? null);
        _classPrivateFieldSet(_currentRobots, this, new _robotDirectives.default({
          userAgent: _classPrivateFieldGet(_options, this).userAgent
        }));
        _assertClassBrand(_HtmlUrlChecker_brand, this, _appendRobotHeaders).call(this);

        // If redirected for HTTP, or original URL for non-HTTP
        const finalPageURL = (response === null || response === void 0 ? void 0 : response.url) ?? _classPrivateFieldGet(_currentPageURL, this);

        // Passes robots instance so that headers are included in robot exclusion checks
        // @todo does the `await` cause `completedPage` to be called twice (other's in COMPLETE_EVENT) if error occurs?
        await _classPrivateFieldGet(_htmlChecker, this).scan(stream, finalPageURL, _classPrivateFieldGet(_currentRobots, this), _classPrivateFieldGet(_currentAuth, this));
      } catch (error) {
        _assertClassBrand(_HtmlUrlChecker_brand, this, _completedPage).call(this, error);
      }
    }).on(_limitedRequestQueue.END_EVENT, () => {
      // Clear references for garbage collection
      _assertClassBrand(_HtmlUrlChecker_brand, this, _reset).call(this);
      this.emit(_events.END_EVENT);
    }));
    _classPrivateFieldSet(_htmlChecker, this, new _HtmlChecker.default(_classPrivateFieldGet(_options, this)).on(_events.ERROR_EVENT, error => this.emit(_events.ERROR_EVENT, error)).on(_events.HTML_EVENT, (tree, robots) => {
      this.emit(_events.HTML_EVENT, tree, robots, _classPrivateFieldGet(_currentResponse, this), _classPrivateFieldGet(_currentPageURL, this), _classPrivateFieldGet(_currentCustomData, this));
    }).on(_events.QUEUE_EVENT, () => this.emit(_events.QUEUE_EVENT)).on(_events.JUNK_EVENT, result => this.emit(_events.JUNK_EVENT, result, _classPrivateFieldGet(_currentCustomData, this))).on(_events.LINK_EVENT, result => this.emit(_events.LINK_EVENT, result, _classPrivateFieldGet(_currentCustomData, this))).on(_events.COMPLETE_EVENT, () => _assertClassBrand(_HtmlUrlChecker_brand, this, _completedPage).call(this)));
  }
  clearCache() {
    _classPrivateFieldGet(_htmlChecker, this).clearCache();
    return this;
  }

  /**
   * Emit PAGE_EVENT and continue the queue.
   * @param {Error} [error]
   */

  dequeue(id) {
    const success = _classPrivateFieldGet(_htmlUrlQueue, this).dequeue(id);
    this.emit(_events.QUEUE_EVENT);
    return success;
  }

  // `auth` is undocumented and for internal use only
  enqueue(pageURL, customData, auth) {
    // @todo this could get messy if there're many different credentials per site (if we cache based on headers)
    const transitive = (0, _httpProtocol.transitiveAuth)(pageURL, auth);
    const id = _classPrivateFieldGet(_htmlUrlQueue, this).enqueue(transitive.url, {
      auth: transitive.auth,
      customData
    });
    this.emit(_events.QUEUE_EVENT);
    return id;
  }
  has(id) {
    return _classPrivateFieldGet(_htmlUrlQueue, this).has(id);
  }
  get isPaused() {
    return _classPrivateFieldGet(_htmlChecker, this).isPaused;
  }
  get numActiveLinks() {
    return _classPrivateFieldGet(_htmlChecker, this).numActiveLinks;
  }
  get numPages() {
    return _classPrivateFieldGet(_htmlUrlQueue, this).length;
  }
  get numQueuedLinks() {
    return _classPrivateFieldGet(_htmlChecker, this).numQueuedLinks;
  }
  pause() {
    _classPrivateFieldGet(_htmlChecker, this).pause();
    _classPrivateFieldGet(_htmlUrlQueue, this).pause();
    return this;
  }
  resume() {
    _classPrivateFieldGet(_htmlChecker, this).resume();
    _classPrivateFieldGet(_htmlUrlQueue, this).resume();
    return this;
  }
  get __cache() {
    return _classPrivateFieldGet(_htmlChecker, this).__cache;
  }
}
exports.default = HtmlUrlChecker;
function _appendRobotHeaders() {
  var _classPrivateFieldGet2;
  const xRobotsTag = (_classPrivateFieldGet2 = _classPrivateFieldGet(_currentResponse, this)) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.headers["x-robots-tag"];

  // @todo https://github.com/nodejs/node/issues/3591
  if (xRobotsTag != null) {
    _classPrivateFieldGet(_currentRobots, this).header(xRobotsTag);
  }
}
function _completedPage(error = null) {
  // @todo emit page error instead?
  // @todo include redirected url if there is one?
  this.emit(_events.PAGE_EVENT, error, _classPrivateFieldGet(_currentPageURL, this), _classPrivateFieldGet(_currentCustomData, this));

  // Auto-starts next queue item, if any
  // Emits REQUEST_QUEUE_END_EVENT, if not
  _classPrivateFieldGet(_currentDone, this).call(this);
}
function _reset() {
  _classPrivateFieldSet(_currentAuth, this, null);
  _classPrivateFieldSet(_currentCustomData, this, null);
  _classPrivateFieldSet(_currentDone, this, null);
  _classPrivateFieldSet(_currentPageURL, this, null);
  _classPrivateFieldSet(_currentResponse, this, null);
  _classPrivateFieldSet(_currentRobots, this, null);
}
module.exports = exports.default;
//# sourceMappingURL=HtmlUrlChecker.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isurl = _interopRequireDefault(require("isurl"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DEFAULT_AUTH = Object.freeze({
  password: "",
  username: ""
});

/**
 * Possibly override `auth` with that from `url`.
 * @param {URL} url
 * @param {object} [auth]
 * @returns {object}
 */
var _default = (url, auth = DEFAULT_AUTH) => {
  if (!(0, _isurl.default)(url)) {
    throw new TypeError("Invalid URL");
  } else if (url.username !== "" || url.password !== "") {
    // Clone to avoid mutation
    url = new URL(url);
    auth = {
      password: url.password,
      username: url.username
    };

    // @todo is this the kind of result we want, with auth stored in `http` ?
    url.password = "";
    url.username = "";
  }
  return {
    auth,
    url
  };
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=transitiveAuth.js.map
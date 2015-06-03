var request = require('browser-request');

function noop() {}

request.setAuth = noop;
request.clearAuth = noop;

module.exports = request;

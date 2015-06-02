var request = require('browser-request');

function noop() {}

request.setAuth = noop;
request.clearAuth = noop;
request.getJar = noop;

module.exports = request;

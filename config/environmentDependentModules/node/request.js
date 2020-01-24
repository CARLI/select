var config = require('../../../config');
var request = require('request');

var jar = request.jar();
request = request.defaults({jar: jar});
var lastAuthSession = null;

request.setAuth = function (authSession) {
    lastAuthSession = authSession;
    jar.setCookie('AuthSession='+authSession, config.storeOptions.couchDbUrl);
};
request.clearAuth = function () {
    jar.setCookie('AuthSession=', config.storeOptions.couchDbUrl);
};

/**
 * During the migration to Docker deployment and reading config variables from the environment,
 * something caused the admin URL's to stop being recognized by Couch. It seems that the regular
 * auth cookie included with the original request started trumping the user:pass in the URL
 * so things like database creation and replication stopped working with
 * { error: 'unauthorized', reason: 'You are not a server admin.' }
 *
 * Bryan and Marty debugged and found that clearing the auth cookie made the privileged url work
 * again. So this little workaround needs to be called right before any privileged access.
 * This is not ideal since it affects the entire global request module, but the middleware resets
 * the auth cookie with each new request.
 *
 * It is possible though, that if a privileged url call was chained with a non-privileged call,
 * this workaround would break the chain, since the un-privileged would then have no auth at all.
 */
request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround = function () {
    console.log("Cookie Auth Workaround Disabled for testing.");
    const cookies = jar.getCookies(config.storeOptions.couchDbUrl);
    const authCookie = cookies.filter(c => c.key === 'AuthSession')[0];
    const cookieValue = Buffer.from(authCookie ? authCookie.value : "", 'base64');
    console.log('AuthSession:', cookieValue);
    //request.clearAuth();
};

request.withoutAuthCookieWorkaround = function(doSomething) {
    if (lastAuthSession != null)
        request.clearAuth();

    var result = doSomething();

    if (lastAuthSession != null)
        request.setAuth(lastAuthSession);

    return result;
};

module.exports = request;

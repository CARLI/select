
var Q = require('q');

var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils')();
var libraryRepository = require('./Entity/LibraryRepository');
var userRepository = require('./Entity/UserRepository');
var vendorRepository = require('./Entity/VendorRepository');

function createSession(userLogin) {
    return couchUtils.couchRequestSession(userLogin);
}

function deleteSession() {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_session', method: 'delete' });
}

function getSession() {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_session', method: 'get' }).then(returnUserContext);

    function returnUserContext(response) {
        return response.userCtx;
    }
}

function getUser(email) {
    return couchUtils
        .couchRequest({ url: config.storeOptions.couchDbUrl + '/_users/org.couchdb.user:' + email, method: 'get' })
        .then(expandReferences);

    function expandReferences(user) {
        var promises = [];

        if (user.hasOwnProperty('vendor')) {
            promises.push(expandVendor(user));
        }
        if (user.hasOwnProperty('library')) {
            promises.push(expandLibrary(user));
        }

        return Q.all(promises).then(function() {
            return user;
        });
    }

    function expandVendor(user) {
        return vendorRepository.load(user.vendor).then(function (vendor) {
            user.vendor = vendor;
            return user;
        });
    }
    function expandLibrary(user) {
        return libraryRepository.load(user.library).then(function (library) {
            user.library = library;
            return user;
        });
    }
}

// This no longer does what it says it does and should be renamed
function masqueradeAsLibrary(libraryId) {
    return getSession()
        .then(makeSureUserIsAllowedToDoThis)
        .then(function() {
            return {ok: true};
        });

    function makeSureUserIsAllowedToDoThis(userCtx) {
        if (userCtx.roles.indexOf('staff') < 0) {
            throw new Error(userCtx.name + ' is not authorized to masquerade as a library');
        }
    }
}
// This no longer does what it says it does and should be renamed
function masqueradeAsVendor(vendorId) {
    return getSession()
        .then(makeSureUserIsAllowedToDoThis)
        .then(function() {
            return {ok: true};
        });

    function makeSureUserIsAllowedToDoThis(userCtx) {
        if (userCtx.roles.indexOf('staff') < 0) {
            throw new Error(userCtx.name + ' is not authorized to masquerade as a vendor');
        }
    }
}

function requireSession() {
    return getSession()
        .then(function (userContext) {
            if (userContext.name) {
                return true;
            }
            throw new Error('Unauthorized');
        });
}

function requireBasicAuthForRestrictedApiV1(request) {

    if (!isConfigured)
        throwNotConfiguredError();
    return Q.when(requireBasicAuth(request, config.restrictedApiV1.username, config.restrictedApiV1.password));

    function isConfigured() {
        return config.hasOwnProperty("restrictedApiV1") &&
            typeof cmUsername !== 'undefined' && typeof cmPassword !== 'undefined' &&
            cmUsername !== "" && cmPassword !== "";
    }

    function throwNotConfiguredError() {
        console.log("ERROR: config.restrictedApiV1 is missing or invalid");
        throw new Error('Unauthorized');
    }
}

function requireBasicAuth(req, expectedUsername, expectedPassword) {

    var auth = req.headers['authorization'];
    if (!auth)
        throw new Error('Unauthorized');

    var splitUsernamePassword = getDecodedBasicAuth(auth).split(':');
    var username = splitUsernamePassword[0];
    var password = splitUsernamePassword[1];

    if (username !== expectedUsername || password !== expectedPassword) {
        throw new Error('Unauthorized');
    }
    return Q.when(true);

    function getDecodedBasicAuth(authHeader) {
        var splitAuthHeader = authHeader.split(' ');
        return new Buffer(splitAuthHeader[1], 'base64').toString();
    }
}

function requireStaff() {
    return getSession().then(function (userContext) {
        if (userContext.roles.indexOf('staff') >= 0) {
            return true;
        }
        throw new Error('Unauthorized');
    });
}
function requireStaffOrLibrary() {
    return getSession().then(function (userContext) {
        if (userContext.roles.indexOf('staff') >= 0 || userContext.roles.indexOf('library') >= 0) {
            return true;
        }
        throw new Error('Unauthorized');
    });
}
function requireStaffOrSpecificVendor(vendorId) {
    return getSession().then(function (userContext) {
        if (userContext.roles.indexOf('staff') >= 0 || userContext.roles.indexOf('vendor-' + vendorId) >=0) {
            return true;
        }
        throw new Error('Unauthorized');
    });
}
function requireStaffOrLibraryOrSpecificVendor(vendorId) {
    return getSession().then(function (userContext) {
        if (userContext.roles.indexOf('staff') >= 0 || userContext.roles.indexOf('library') >= 0 || userContext.roles.indexOf('vendor-' + vendorId) >=0) {
            return true;
        }
        throw new Error('Unauthorized');
    });
}

module.exports = {
    createSession: createSession,
    deleteSession: deleteSession,
    getSession: getSession,
    getUser: getUser,
    masqueradeAsLibrary: masqueradeAsLibrary,
    masqueradeAsVendor: masqueradeAsVendor,
    requireSession: requireSession,
    requireStaff: requireStaff,
    requireBasicAuthForRestrictedApiV1: requireBasicAuthForRestrictedApiV1,
    requireStaffOrLibrary: requireStaffOrLibrary,
    requireStaffOrSpecificVendor: requireStaffOrSpecificVendor,
    requireStaffOrLibraryOrSpecificVendor: requireStaffOrLibraryOrSpecificVendor
};

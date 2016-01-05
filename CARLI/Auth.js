
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
        if (user.hasOwnProperty('vendor')) {
            user = expandVendor(user);
        }
        if (user.hasOwnProperty('library')) {
            user = expandLibrary(user);
        }
        return user;
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

function masqueradeAsLibrary(libraryId) {
    return getSession()
        .then(setupUserForMasquerading)
        .then(function() {
            return {ok: true};
        });

    function setupUserForMasquerading(userCtx) {
        if (userCtx.roles.indexOf('staff') < 0) {
            throw new Error(userCtx.name + ' is not authorized to masquerade as a library');
        }
        var userId = 'org.couchdb.user:' + userCtx.name;
        return userRepository.setMasqueradingLibraryIdForUserId(libraryId, userId);
    }
}
function masqueradeAsVendor(vendorId) {
    return getSession()
        .then(setupUserForMasquerading)
        .then(function() {
            return {ok: true};
        });

    function setupUserForMasquerading(userCtx) {
        if (userCtx.roles.indexOf('staff') < 0) {
            throw new Error(userCtx.name + ' is not authorized to masquerade as a vendor');
        }
        var userId = 'org.couchdb.user:' + userCtx.name;
        return userRepository.setMasqueradingVendorIdForUserId(vendorId, userId);
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
    requireStaffOrLibrary: requireStaffOrLibrary,
    requireStaffOrSpecificVendor: requireStaffOrSpecificVendor,
    requireStaffOrLibraryOrSpecificVendor: requireStaffOrLibraryOrSpecificVendor
};

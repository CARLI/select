
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils')();
var libraryRepository = require('./Entity/LibraryRepository');
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
            return expandVendor(user);
        } else if (user.hasOwnProperty('library')) {
            return expandLibrary(user);
        } else {
            return user;
        }
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

function requireStaff() {
    return getSession().then(function (userContext) {
        if (userContext.roles.indexOf('staff') >= 0) {
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
    requireStaff: requireStaff
};

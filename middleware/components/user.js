
var config = require( '../../config' );
var StoreOptions = config.storeOptions;
var Store = require( '../../CARLI/Store' );
var StoreModule = require( '../../CARLI/Store/CouchDb/Store');
var userRepository = require('../../CARLI/Entity/UserRepository');

var privilegedStoreOptions = {
    couchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbName: '_users'
};

function list() {
    userRepository.setStore( Store( StoreModule(privilegedStoreOptions) ) );
    return userRepository.list();
}

module.exports = {
    list: list
};

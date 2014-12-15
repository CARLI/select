var Entity = require('../Entity')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
;

var LicenseRepository = Entity('License');
LicenseRepository.setStore( Store( StoreModule(StoreOptions) ) );

module.exports = LicenseRepository;

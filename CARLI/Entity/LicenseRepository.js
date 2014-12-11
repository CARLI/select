var Entity = require('../Entity')
    , config = require( '../config' )
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/' + config.store )( config.storeOptions )

var LicenseRepository = Entity('License');
LicenseRepository.setStore( Store( StoreModule ) );

module.exports = LicenseRepository;

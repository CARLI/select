var Entity = require('../Entity')
    , config = require( '../config' )
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/' + config.store )( config.storeOptions )
    ;

var VendorRepository = Entity('Vendor');
VendorRepository.setStore( Store( StoreModule ) );

module.exports = VendorRepository;

var Entity = require('../Entity')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
    ;

var VendorRepository = Entity('Vendor');
VendorRepository.setStore( Store( StoreModule(StoreOptions) ) );

module.exports = VendorRepository;

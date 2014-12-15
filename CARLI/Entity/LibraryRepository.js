var Entity = require('../Entity')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
    ;

var LibraryRepository = Entity('Library');
LibraryRepository.setStore( Store( StoreModule(StoreOptions) ) );

LibraryRepository.publicFunc = function(){};

module.exports = LibraryRepository;

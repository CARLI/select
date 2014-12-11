var Entity = require('../Entity')
    , config = require( '../config' )
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/' + config.store )( config.storeOptions )
    ;

var LibraryRepository = Entity('Library');
LibraryRepository.setStore( Store( StoreModule ) );

LibraryRepository.publicFunc = function(){};

module.exports = LibraryRepository;

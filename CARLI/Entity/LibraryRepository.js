var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
    , moment = require('moment')
    , Q = require('q')
    ;

var LibraryRepository = Entity('Library');
LibraryRepository.setStore( Store( StoreModule(StoreOptions) ) );

module.exports = LibraryRepository;

var propertiesToTransform = [];

function transformFunction( library ){
    EntityTransform.transformObjectForPersistence(library, propertiesToTransform);
}

function createLibrary( library ){
    return LibraryRepository.create( library, transformFunction );
}

function updateLibrary( library ){
    return LibraryRepository.update( library, transformFunction );
}

function listLibraries(){
    return EntityTransform.expandListOfObjectsFromPersistence( LibraryRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadLibrary( libraryId ){
    var deferred = Q.defer();

    LibraryRepository.load( libraryId )
        .then(function (library) {
            EntityTransform.expandObjectFromPersistence( library, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(library);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(library);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}


/* functions that get added as instance methods on loaded Libraries */

var functionsToAdd = {
};

module.exports = {
    setStore: LibraryRepository.setStore,
    create: createLibrary,
    update: updateLibrary,
    list: listLibraries,
    load: loadLibrary
};

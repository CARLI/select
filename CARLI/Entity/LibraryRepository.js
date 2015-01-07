var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
    , moment = require('moment')
    , Q = require('q')
    , Validator = require('../Validator')
    ;

var LibraryRepository = Entity('Library');
LibraryRepository.setStore( Store( StoreModule(StoreOptions) ) );

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

function getInstitutionTypeOptions(){
    return Validator.getEnumValuesFor('InstitutionType');
}

function getInstitutionYearsOptions(){
    return Validator.getEnumValuesFor('InstitutionYears');
}

function getMembershipLevelOptions(){
    return Validator.getEnumValuesFor('MembershipLevel');
}

module.exports = {
    setStore: LibraryRepository.setStore,
    create: createLibrary,
    update: updateLibrary,
    list: listLibraries,
    load: loadLibrary,
    getInstitutionTypeOptions: getInstitutionTypeOptions,
    getInstitutionYearsOptions: getInstitutionYearsOptions,
    getMembershipLevelOptions: getMembershipLevelOptions
};

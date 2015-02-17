var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , middleware = require('../../config/environmentDependentModules').middleware
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , CouchUtils = require( '../Store/CouchDb/Utils')
    , Q = require('q')
    , Validator = require('../Validator')
    , _ = require('lodash')
    ;

var localLibraryRepository = Entity('LibraryNonCrm');
localLibraryRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = [];

function transformFunction( library ){
    EntityTransform.transformObjectForPersistence(library, propertiesToTransform);
}

function updateLibrary( library ){
    var localData = EntityTransform.extractValuesForSchema(library, 'LibraryNonCrm');
    return loadNonCrmLibraryForCrmId(library.id).then(function (libraryNonCrm) {
        localData = _.extend({}, libraryNonCrm, localData);
        localData.crmId = library.id;
        return localLibraryRepository.update( localData, transformFunction );
    });
}

function listLibraries(){
    return middleware.listLibraries().then(function(libraries) {
        return libraries.map(function (library) {
            library.id = library.crmId;
            return library;
        });
    });
    //return EntityTransform.expandListOfObjectsFromPersistence( localLibraryRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadLibrary( libraryCrmId ){
    return middleware.loadLibrary(libraryCrmId);
    /*
    var deferred = Q.defer();

    localLibraryRepository.load( libraryId )
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
    */
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

function loadNonCrmLibraryForCrmId( crmId ){
    return CouchUtils.getCouchViewResultValues(config.getDbName(), 'loadNonCrmLibraryForCrmId', crmId);
}

module.exports = {
    setStore: localLibraryRepository.setStore,
    create: createLibrary,
    update: updateLibrary,
    list: listLibraries,
    load: loadLibrary,
    getInstitutionTypeOptions: getInstitutionTypeOptions,
    getInstitutionYearsOptions: getInstitutionYearsOptions,
    getMembershipLevelOptions: getMembershipLevelOptions
};

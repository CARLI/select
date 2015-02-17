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

function fillInNonCrmData( library ){
    return loadNonCrmLibraryForCrmId(library.crmId).then(function (libraryNonCrm) {
        var result = _.extend({}, library, libraryNonCrm);
        result.id = library.crmId;
        return result;
    });
}

function updateLibrary( library ){
    var localData = EntityTransform.extractValuesForSchema(library, 'LibraryNonCrm');
    return loadNonCrmLibraryForCrmId(library.id).then(function (libraryNonCrm) {
        localData = _.extend({}, libraryNonCrm, localData);
        localData.crmId = library.id;

        if ( localData.id ){
            return localLibraryRepository.update( localData, transformFunction );
        }
        else {
            return localLibraryRepository.create( localData, transformFunction );
        }
    });
}

function listLibraries(){
    return middleware.listLibraries().then(function(libraries) {
        return Q.all( libraries.map(fillInNonCrmData) );
    });
}

function loadLibrary( libraryCrmId ){
    return middleware.loadLibrary(libraryCrmId).then(fillInNonCrmData);
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
    return CouchUtils.getCouchViewResultValues(config.getDbName(), 'loadNonCrmLibraryForCrmId', crmId)
        .then(function( resultsArray ){
            return resultsArray[0] ? resultsArray[0] : {};
        });
}

module.exports = {
    setStore: localLibraryRepository.setStore,
    update: updateLibrary,
    list: listLibraries,
    load: loadLibrary,
    getInstitutionTypeOptions: getInstitutionTypeOptions,
    getInstitutionYearsOptions: getInstitutionYearsOptions,
    getMembershipLevelOptions: getMembershipLevelOptions,
    loadNonCrmLibraryForCrmId: loadNonCrmLibraryForCrmId
};

var CrmLibraryEntity = require('./CrmLibraryEntity')
    , Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , CouchUtils = require( '../Store/CouchDb/Utils')()
    , Q = require('q')
    , Validator = require('../Validator')
    , _ = require('lodash')
    ;

var crmLibraryRepository = CrmLibraryEntity();

var localLibraryRepository = Entity('LibraryNonCrm');
localLibraryRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = [];

function transformFunction( library ){
    EntityTransform.transformObjectForPersistence(library, propertiesToTransform);
}

function loadAndFillInNonCrmDataForLibrary( library ){
    return loadNonCrmLibraryForCrmId(library.crmId)
        .then(function(nonCrmLibrary){
            return combineCrmDataAndNonCrmData(library, nonCrmLibrary);
        });
}

function associateNonCrmDataWithListOfLibraries( libraryList ){
    return localLibraryRepository.list()
        .then(function(nonCrmData){
            var nonCrmDataByCrmId = {};

            nonCrmData.forEach(function(nonCrmLibrary){
                nonCrmDataByCrmId[nonCrmLibrary.crmId] = nonCrmLibrary;
            });

            return nonCrmDataByCrmId;
        })
        .then(function(nonCrmDataByCrmId){
            return libraryList.map(function(library){
                return combineCrmDataAndNonCrmData(library, nonCrmDataByCrmId[library.crmId]);
            });
        });
}

function combineCrmDataAndNonCrmData( crmLibrary, nonCrmLibrary ){
    var result = _.extend({}, crmLibrary, nonCrmLibrary);
    result.id = crmLibrary.crmId;
    result.type = 'Library';
    return result;
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
    return crmLibraryRepository.list()
        .then(associateNonCrmDataWithListOfLibraries);
}

function listActiveLibraries(){
    return crmLibraryRepository.list()
        .then(filterActiveLibraries)
        .then(associateNonCrmDataWithListOfLibraries);


    function filterActiveLibraries(libraries){
        return libraries.filter(function(library){
            return library.isActive;
        });
    }
}

function loadLibrary( libraryCrmId ){
    return crmLibraryRepository.load(libraryCrmId)
        .then(loadAndFillInNonCrmDataForLibrary);
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

function listLibrariesWithSelectionsInCycle( cycle ){
    return CouchUtils.getCouchViewResultObject(cycle.getDatabaseName(), 'listLibrariesWithSelections', null, true)
        .then(function(resultObject){
            return Object.keys(resultObject);
        });
}

function getLibrariesById( ids ){
    return listLibraries()
        .then(filterListOfLibraries);

    function filterListOfLibraries( listOfAllLibraries ){
        return listOfAllLibraries.filter(libraryIdIsInRequestedList);
    }

    function libraryIdIsInRequestedList( library ){
        return ids.indexOf(library.id) > -1;
    }
}

function setStore(store) {
    localLibraryRepository.setStore(store);
    CouchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    setStore: setStore,
    update: updateLibrary,
    list: listLibraries,
    listActiveLibraries: listActiveLibraries,
    load: loadLibrary,
    getInstitutionTypeOptions: getInstitutionTypeOptions,
    getInstitutionYearsOptions: getInstitutionYearsOptions,
    getMembershipLevelOptions: getMembershipLevelOptions,
    loadNonCrmLibraryForCrmId: loadNonCrmLibraryForCrmId,
    listLibrariesWithSelectionsInCycle: listLibrariesWithSelectionsInCycle,
    getLibrariesById: getLibrariesById
};

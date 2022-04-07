var CrmLibraryEntity = require('./CrmLibraryEntity');
var Entity = require('../Entity');
var EntityTransform = require('./EntityTransformationUtils');
var config = require('../../config');
var StoreOptions = config.storeOptions;
var Store = require('../Store');
var StoreModule = require('../Store/CouchDb/Store');
var CouchUtils = require('../Store/CouchDb/Utils')();
var Q = require('q');
var Validator = require('../Validator');
var _ = require('lodash');


var CONTACT_CATEGORY_ESTIMATE = 'Subscription Contacts';
var CONTACT_CATEGORY_INVOICE  = 'Invoice Contacts';
var CONTACT_CATEGORY_REMINDER = 'Reminder Contacts';

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

            nonCrmData.forEach(function (nonCrmLibrary) {
                nonCrmDataByCrmId[ nonCrmLibrary.crmId ] = nonCrmLibrary;
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
        var nonCrmData = _.extend(libraryNonCrm, localData);
        nonCrmData.crmId = library.id;
        nonCrmData.contacts = localData.contacts.slice(0);
        nonCrmData.previousIpAddresses = library.previousIpAddresses;

        if ( nonCrmData.id ){
            return localLibraryRepository.update( nonCrmData, transformFunction );
        }
        else {
            return localLibraryRepository.create( nonCrmData, transformFunction );
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

function listActiveNonAffiliateLibraries(){
    return listActiveLibraries()
        .then(libraries => libraries.filter(library => library.membershipLevel !== "Affiliate"));
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

function getActiveLibrariesById(ids) {
    return getLibrariesById(ids, true);
}

function getLibrariesById( ids, activeOnly = false ){
    var listPromise = activeOnly ? listActiveLibraries() : listLibraries();

    return listPromise
        .then(filterListOfLibraries);

    function filterListOfLibraries( listOfAllLibraries ){
        return listOfAllLibraries.filter(libraryIdIsInRequestedList);
    }

    function libraryIdIsInRequestedList( library ){
        return ids.indexOf(library.id) > -1;
    }
}

function getContactTypesForNotificationCategory(contactCategory){
    if ( contactCategory === CONTACT_CATEGORY_ESTIMATE ){
        return ['Billing'];
    }
    if ( contactCategory === CONTACT_CATEGORY_INVOICE ){
        return ['Billing'];
    }
    if ( contactCategory === CONTACT_CATEGORY_REMINDER ){
        return ['Director', 'E-Resources Liaison'];
    }
    else {
        return ['Unknown Category'];
    }
}

function getContactEmailAddressesForNotification(listOfContacts, contactCategory){
    var contactTypes = getContactTypesForNotificationCategory(contactCategory);
    return getContactEmailAddressesForContactTypes(listOfContacts, contactTypes);
}

function getContactEmailAddressesForContactTypes(listOfContacts, arrayOfContactTypes){
    if ( !listOfContacts ){
        return [];
    }
    return listOfContacts.filter(matchingTypes).map(extractEmail);

    function matchingTypes(contact){
        return arrayOfContactTypes.indexOf(contact.contactType) != -1;
    }

    function extractEmail(contact){
        return contact.email;
    }
}

function listAllContactsForLibrary(libraryId){
    return Q.all([
            getCustomContactsForLibrary(libraryId),
            crmLibraryRepository.listCrmContactsForLibrary(libraryId)
        ])
        .then(function(arrayOfContactLists){
            return _.flatten(arrayOfContactLists);
        });

    function getCustomContactsForLibrary(libraryId){
        return loadNonCrmLibraryForCrmId(libraryId)
            .then(function(library){
                return library.contacts || [];
            });
    }
}

//This method adds the library name to the contacts since this is mainly used by the Contacts report
function listAllContacts(){
    var customContacts = [];

    return listActiveLibraries()
        .then(extractCustomContacts)
        .then(queryForCrmContacts)
        .then(function(crmContacts){
            return crmContacts.concat(customContacts);
        });

    function extractCustomContacts( listOfLibraries ){
        customContacts = _.flatten(listOfLibraries.map(extractContact));

        function extractContact(library){
            return library.contacts.map(addLibraryName);

            function addLibraryName(contact){
                contact.library = library.name;
                return contact;
            }
        }

        return listOfLibraries;
    }

    function queryForCrmContacts( listOfLibraries ){
        var libraryIds = listOfLibraries.map(function(library){ return library.id });
        return crmLibraryRepository.listCrmContactsForLibraryIds(libraryIds);
    }
}

function setStore(store) {
    localLibraryRepository.setStore(store);
    CouchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    CONTACT_CATEGORY_ESTIMATE: CONTACT_CATEGORY_ESTIMATE,
    CONTACT_CATEGORY_INVOICE: CONTACT_CATEGORY_INVOICE,
    CONTACT_CATEGORY_REMINDER: CONTACT_CATEGORY_REMINDER,
    setStore: setStore,
    update: updateLibrary,
    list: listLibraries,
    listActiveLibraries: listActiveLibraries,
    listActiveNonAffiliateLibraries: listActiveNonAffiliateLibraries,
    load: loadLibrary,
    getInstitutionTypeOptions: getInstitutionTypeOptions,
    getInstitutionYearsOptions: getInstitutionYearsOptions,
    getMembershipLevelOptions: getMembershipLevelOptions,
    loadNonCrmLibraryForCrmId: loadNonCrmLibraryForCrmId,
    listLibrariesWithSelectionsInCycle: listLibrariesWithSelectionsInCycle,
    getActiveLibrariesById: getActiveLibrariesById,
    getLibrariesById: getLibrariesById,
    getContactTypesForNotificationCategory: getContactTypesForNotificationCategory,
    getContactEmailAddressesForNotification: getContactEmailAddressesForNotification,
    listCrmContactsForLibrary: crmLibraryRepository.listCrmContactsForLibrary,
    listAllContactsForLibrary: listAllContactsForLibrary,
    listAllContacts: listAllContacts
};

var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , couchUtils = require('../Store/CouchDb/Utils')()
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , moment = require('moment')
    , Q = require('q')
    ;

var CONTACT_CATEGORY_REPORT = 'Report Contacts';

var VendorRepository = Entity('Vendor');
VendorRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = [];

function transformFunction( vendor ){
    EntityTransform.transformObjectForPersistence(vendor, propertiesToTransform);
}

function createVendor( vendor ){
    return VendorRepository.create( vendor, transformFunction );
}

function updateVendor( vendor ){
    return VendorRepository.update( vendor, transformFunction );
}

function listVendors(){
    return EntityTransform.expandListOfObjectsFromPersistence( VendorRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadVendor( vendorId ){
    var deferred = Q.defer();

    VendorRepository.load( vendorId )
        .then(function (vendor) {
            EntityTransform.expandObjectFromPersistence( vendor, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(vendor);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(vendor);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function getVendorsById( ids ){
    return couchUtils.getCouchDocuments(StoreOptions.couchDbName,ids);
}

function getContactTypesForNotificationCategory(contactCategory){
    if ( contactCategory === CONTACT_CATEGORY_REPORT ){
        return ['Sales'];
    }
    else {
        return ['Unknown Category'];
    }
}

function getContactEmailAddressesForNotification(vendor, contactCategory){
    var contactTypes = getContactTypesForNotificationCategory(contactCategory);
    return getContactEmailAddressesForContactTypes(vendor, contactTypes);
}

function getContactEmailAddressesForContactTypes(vendor, arrayOfContactTypes){
    if ( !vendor || !vendor.contacts ){
        return [];
    }

    return vendor.contacts.filter(matchingTypes).map(extractEmail);

    function matchingTypes(contact){
        return arrayOfContactTypes.indexOf(contact.contactType) != -1;
    }

    function extractEmail(contact){
        return contact.email;
    }
}

/* functions that get added as instance methods on loaded Vendors */

var functionsToAdd = {
};

function setStore(store) {
    VendorRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    CONTACT_CATEGORY_REPORT: CONTACT_CATEGORY_REPORT,
    setStore: VendorRepository.setStore,
    create: createVendor,
    update: updateVendor,
    list: listVendors,
    load: loadVendor,
    getVendorsById: getVendorsById,
    getContactTypesForNotificationCategory: getContactTypesForNotificationCategory,
    getContactEmailAddressesForNotification: getContactEmailAddressesForNotification
};

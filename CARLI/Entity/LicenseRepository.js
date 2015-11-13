
var Q = require('q');

var config = require( '../../config' );
var CouchUtils = require( '../Store/CouchDb/Utils')();
var CycleRepository = require('./CycleRepository');
var Entity = require('../Entity');
var EntityTransform = require( './EntityTransformationUtils');
var moment = require('moment');
var ProductRepository = require('./ProductRepository');
var Store = require( '../Store' );
var StoreModule = require( '../Store/CouchDb/Store');
var Validator = require('../Validator');

var LicenseRepository = Entity('License');
LicenseRepository.setStore( Store( StoreModule(config.storeOptions) ) );

/* functions that get added as instance methods on loaded licenses */
function getIsActive() {
    if ( this.vendor && this.vendor.isActive !== undefined) {
        return this.isActive && this.vendor.isActive;
    }
    return this.isActive;
}

function contractTermEndsSoon() {
    var termEndDate = moment(new Date(this.totalTermEndDate));
    var nineMonthsBeforeTermEnds = termEndDate.subtract(9, 'months');
    return moment().isAfter(nineMonthsBeforeTermEnds);
}

var functionsToAdd = {
    getIsActive: getIsActive,
    contractTermEndsSoon: contractTermEndsSoon
};

var propertiesToTransform = ['vendor'];

function transformFunction( license ){
    EntityTransform.transformObjectForPersistence(license, propertiesToTransform);
}


function createLicense( license ){
    return LicenseRepository.create( license, transformFunction );
}

function updateLicense( license ){
    return LicenseRepository.update( license, transformFunction );
}

function listLicenses(){
    return EntityTransform.expandListOfObjectsFromPersistence( LicenseRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadLicense( licenseId ){
    var deferred = Q.defer();

    LicenseRepository.load( licenseId )
        .then(function (license) {
            EntityTransform.expandObjectFromPersistence( license, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(license);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database to vendor in license', err);
                    deferred.resolve(license);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listLicensesUnexpanded(){
    return LicenseRepository.list();
}

function listLicensesForVendorId( vendorId ){
    return CouchUtils.getCouchViewResultValues(config.getDbName(), 'listLicensesForVendorId', vendorId);
}
function getOfferingTypeOptions(){
    return Validator.getEnumValuesFor('License', 'offeringType');
}

function getLicensesById( ids ){
    return CouchUtils.getCouchDocuments(config.getDbName(), ids);
}

function setStore(store) {
    LicenseRepository.setStore(store);
    CouchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    setStore: setStore,
    create: createLicense,
    update: updateLicense,
    list: listLicenses,
    load: loadLicense,
    listLicensesUnexpanded: listLicensesUnexpanded,
    listLicensesForVendorId: listLicensesForVendorId,
    getOfferingTypeOptions: getOfferingTypeOptions,
    getLicensesById: getLicensesById
};

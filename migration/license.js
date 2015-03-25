var LicenseRepository = require('../CARLI').License;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
LicenseRepository.setStore(Store(CouchDbStore(StoreOptions)));

function migrateLicenses(connection){
    var resultsPromise = Q.defer();

    var query = "select id, contract_type, database_type, current_term, extension_date, purchase_date, download, ill, limited_sharing, ereserves, course_packs, print, walkins, description from contracts";
    connection.query(query, function(err, rows, fields) {
        if(err) { console.log(err); }

        extractLicenses(rows)
            .then(function(idMap){
                resultsPromise.resolve(idMap);
            })
            .catch(function(err){
                console.error('Error creating licenses: ',err);
            });
    });

    return resultsPromise.promise;
}

function extractLicenses( licenseRows ){
    var idalToCouchIds = {};

    var licenseIdMappingObjectPromises = licenseRows.map(createLicense);

    return Q.all( licenseIdMappingObjectPromises )
        .then(function( licenseIdMappingObjects ){
            licenseIdMappingObjects.forEach(function( licenseIdMappingObject ){
                idalToCouchIds[licenseIdMappingObject.idalLegacyId] = licenseIdMappingObject.couchId;
            });

            return idalToCouchIds;
        })
}

function createLicense( licenseRow ){
    return LicenseRepository.create(extractLicense(licenseRow))
        .then(function(licenseId){
            return {
                couchId: licenseId,
                idalLegacyId: licenseRow.id
            }
        });
}

function extractLicense( licenseRow ){
    return {
        name: licenseRow.description || 'License ' + licenseRow.id,
        vendor: '?',
        contractNumber: '',
        //redactedLicenseFile:
        //fullLicenseFile:
        //eResourcesComments:
        //businessComments:
        isActive: true,
        effectiveDate: licenseRow.purchase_date || '',
        totalTermStartDate: '',
        totalTermEndDate: licenseRow.extension_date || '',
        currentTermStartDate: licenseRow.current_term || '',
        currentTermEndDate: licenseRow.current_term || '',
        remainingRenewals: 0,
        terms: {
            downloadTerms: licenseRow.download || '',
            coursePacksTerms: licenseRow.course_packs || '',
            interLibraryLoanTerms: licenseRow.ill || '',
            printTerms: licenseRow.print || '',
            limitedScholarlySharingTerms: licenseRow.limited_sharing || '',
            walkinTerms: licenseRow.walkins || '',
            eReservesTerms: licenseRow.ereserves || '',
            hasConfidentialityTerms: 'no'
        },
        purchaseOrderNumber: '',
        purchaseOrderAmount: '',
        purchaseOrderBalance: '',
        bannerId: '',
        isRfp: false,
        isSoleSource: false,
        isSealedBid: false,
        isOtherType: false,
        otherType: '',
        offeringType: 'Product'
    };
}

module.exports = {
    migrateLicenses: migrateLicenses
};
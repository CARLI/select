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
        currentTermStartDate: splitCurrentTerm(0),
        currentTermEndDate: splitCurrentTerm(1),
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
        licenseType: {
            isThirdPartyProduct: false,
            isSoleSource: false,
            isSealedBid: false,
            isConsolidatedList: false,
            isRfp: false,
            isOtherType: false,
            otherType: '',
            hasArchiveCapitalFee: false
        },
        purchaseOrderNumber: '',
        purchaseOrderAmount: '',
        purchaseOrderBalance: '',
        bannerId: '',
        offeringType: 'Product'
    };

    function splitCurrentTerm( index ){
        if ( licenseRow.current_term ){
            return licenseRow.current_term.split('-')[index];
        }
        else {
            return '';
        }
    }
}


function attachVendorsToLicenses( connection, licenseIdMapping, vendorIdMapping ){
    var resultsPromise = Q.defer();

    var query = "SELECT contract_id, vendor_id FROM contract_vendor_db GROUP BY contract_id;";
    connection.query(query, function(err, rows, fields) {
        if(err) { console.log(err); }

        Q.all( rows.map(linkVendorToLicense))
            .then(function(){
                resultsPromise.resolve(rows.length);
            })
            .catch(function(err){
                console.error('Error associating Licenses with Vendors: ',err);
            });
    });

    return resultsPromise.promise;


    function linkVendorToLicense( associationRow ){
        var licenseLegacyId = associationRow.contract_id;
        var licenseCouchId = licenseIdMapping[licenseLegacyId];
        var vendorLegacyId = associationRow.vendor_id;
        var vendorCouchId = vendorIdMapping[vendorLegacyId];

        return LicenseRepository.load(licenseCouchId)
            .then(setVendorPropertyOnLicense)
            .then(LicenseRepository.update);


        function setVendorPropertyOnLicense(license){
            license.vendor = vendorCouchId;
            return license;
        }
    }
}

function generateProductLicenseAssociations( connection, licenseIdMapping ){
    var resultsPromise = Q.defer();
    var productIdalIdToLicenseCouchIdMap = {};

    var query = "SELECT * FROM contract_vendor_db";
    connection.query(query, function(err, rows, fields) {
        if (err){
            console.log(err);
            resultsPromise.reject(err);
        }

        rows.forEach(mapProductIdalIdToLicenseCouchId);
        resultsPromise.resolve( productIdalIdToLicenseCouchIdMap );
    });

    return resultsPromise.promise;


    function mapProductIdalIdToLicenseCouchId( associationRow ){
        var licenseLegacyId = associationRow.contract_id;
        var vendorLegacyId = associationRow.vendor_id;
        var productLegacyId = associationRow.db_id;
        var licenseCouchId = licenseIdMapping[licenseLegacyId];

        productIdalIdToLicenseCouchIdMap[vendorLegacyId+productLegacyId] = licenseCouchId;
    }
}

module.exports = {
    migrateLicenses: migrateLicenses,
    attachVendorsToLicenses: attachVendorsToLicenses,
    generateProductLicenseAssociations: generateProductLicenseAssociations
};
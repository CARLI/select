var VendorRepository = require('../CARLI').Vendor;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
VendorRepository.setStore(Store(CouchDbStore(StoreOptions)));


function migrateVendors(connection) {
    var resultsPromise = Q.defer();

    var query = "select * from vendor";
    connection.query(query, function(err, rows, fields) {
        if(err) { Logger.log(err); }

        extractVendors(rows).then(function(idMap){
            resultsPromise.resolve(idMap);
        });
    });

    return resultsPromise.promise;
}

function extractVendors(vendors) {
    var idalIdsToCouchIds = {};
    var extractVendorsPromises = [];
    var resultsPromise = Q.defer();

    for (var i in vendors) {
        var createVendorPromise = createVendor(vendors[i]);

        extractVendorsPromises.push(createVendorPromise);

        createVendorPromise.then(function(resultObj){
            idalIdsToCouchIds[resultObj.idalLegacyId] = resultObj.couchId;
        });
    }

    Q.all(extractVendorsPromises).then(function(){
        resultsPromise.resolve(idalIdsToCouchIds);
    });

    return resultsPromise.promise;
}

function createVendor(vendorRow){
    //Logger.log('  creating vendor ' + vendorRow.name);

    var couchIdPromise = Q.defer();
    var vendor = extractVendor(vendorRow);

    VendorRepository.create( vendor )
        .then(function(id) {
            couchIdPromise.resolve({
                couchId: id,
                idalLegacyId: vendorRow.id
            });
        })
        .catch(function(err) {
            Logger.log('Error creating vendor:', err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

function extractVendor(v) {
    return {
        name: v.name,
        previousName: "",
        websiteUrl: v.info_url || '',
        contacts: extractVendorContacts(v),
        comments: "",
        adminModule: v.admin_module_url || '',
        isActive: true,
        mayOfferOneTimePurchaseProducts: false
    };
}

function extractVendorContacts(vendor) {

    contactList = [];
    if (vendor.salesrep_name) {
        contactList.push(extractSalesContact(vendor, 'salesrep'));
    }
    if (vendor.salesrep2_name) {
        contactList.push(extractSalesContact(vendor, 'salesrep2'));
    }
    if (vendor.technicalcontact_name) {
        contactList.push(extractTechnicalContact(vendor, 'technicalcontact'));
    }
    if (vendor.technicalcontact2_name) {
        contactList.push(extractTechnicalContact(vendor, 'technicalcontact2'));
    }
    return contactList;
}

function extractSalesContact(vendor, prefix) {
    return {
        name: vendor[prefix + '_name'],
        email: vendor[prefix + '_email'] || '',
        phoneNumber: vendor[prefix + '_phone'] || '',
        contactType: "Sales"
    };
}

function extractTechnicalContact(vendor, prefix) {
    return {
        name: vendor[prefix + '_name'],
        email: vendor[prefix + '_email'] || 'x',
        phoneNumber: vendor[prefix + '_phone'] || '',
        contactType: "Technical"
    };
}

module.exports = {
    migrateVendors: migrateVendors
};

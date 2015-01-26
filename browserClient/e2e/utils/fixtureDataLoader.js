
var CARLI  = require( '../../../CARLI');
var testUtils = require('../../../CARLI/test/utils');

var storeOptions = {
    couchDbUrl: CARLI.config.storeOptions.couchDbUrl,
    couchDbName: CARLI.config.storeOptions.couchDbName
};
var store = CARLI.Store( CARLI.CouchDbStore(storeOptions) );

CARLI.Cycle.setStore( store );
CARLI.Library.setStore( store );
CARLI.License.setStore( store );
CARLI.Vendor.setStore( store );

function testCycleData() {
    return {
        idalId: 200,
        name: testUtils.testDbMarker + ' E2E Tests 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    };
}
var testCycle = null;
function createTestCycle() {
    return CARLI.Cycle.create(testCycleData())
        .then(CARLI.Cycle.load)
        .then(function (cycle) {
            testCycle = cycle;
        });
}

module.exports = {
    createLibrary : function (data) {
        CARLI.Library.create(data).catch(function(err){
            console.log("Creating Fixture Library failed ", err, data);
        });
    },

    createVendor : function (data) {
        CARLI.Vendor.create(data).catch(function(err){
            console.log("Creating Fixture Vendor failed ", err, data);
        });
    },

    createProduct : function (data) {
        if (testCycle == null) {
            throw new Error("-------------this isn't going to work");
        } else {
            console.log("+++++++++Creating product");
            CARLI.Product.create(data, testCycle).catch(function(err){
                console.log("Creating Fixture Product failed ", err, data);
            });
        }
    },

    createLicense : function (data) {
        CARLI.License.create(data).catch(function(err){
            console.log("Creating Fixture License failed ", err, data);
        });
    },

    createTestCycle: createTestCycle
};

var chai = require('chai');
var expect = chai.expect;
var config = require('../../config');
var couchUtils = require('../Store/CouchDb/Utils');
var cycleRepositoryCarli = require('../Entity/CycleRepository');
var cycleRepositoryForVendor = require('../Entity/CycleRepositoryForVendor');
var Q = require('q');
var request = require('request');
var storeOptions = config.storeOptions;
var testUtils = require('./utils');

testUtils.setupTestDb();

var vendor = {
    id: '1234'
};
var cycleRepositoryVendor = cycleRepositoryForVendor(vendor);

var uniqueCycleNameSuffix = 3000;
function validCycleData() {
    uniqueCycleNameSuffix++;
    return {
        type: 'Cycle',
        name: testUtils.testDbMarker + ' Cycle For Vendor ' + uniqueCycleNameSuffix,
        cycleType: 'Fiscal Year',
        year: 3001,
        status: 0,
        isArchived: false
    };
}

describe('Cycle repository for a specific vendor', function() {
    it('should override the getDatabaseName method of the Cycle', function() {
        var cycle = validCycleData();

        return cycleRepositoryCarli.create(cycle)
            .then(cycleRepositoryVendor.load)
            .then(function (loadedCycle) {
                return expect(loadedCycle.getDatabaseName()).to.equal(loadedCycle.databaseName + '-1234');
            });
    });

    describe('listActiveCycles', function() {
        it('should include only cycles open to vendors', function() {
            var nonOpenCycle = validCycleData();
            var openCycle = validCycleData();
            openCycle.status = 2;

            return setupFixtures().then(ensureOnlyOpenToVendorCycles);

            function setupFixtures() {
                return Q.all([ cycleRepositoryCarli.create(openCycle), cycleRepositoryCarli.create(nonOpenCycle) ]);
            }
            function ensureOnlyOpenToVendorCycles() {
                return cycleRepositoryVendor.listActiveCycles().then(function(cycleList) {
                    return expect(cycleList).to.satisfy(includesOnlyOpenCycles);
                });
            }
            function includesOnlyOpenCycles(cycleList) {
                return cycleList.every(function (cycle) {
                    return cycle.status === 2;
                });
            }
        });
    });

    describe('createDatabase', function () {
        var cycle = validCycleData();

        it('creates a new couch database', function () {
            return cycleRepositoryCarli.create(cycle)
                .then(cycleRepositoryVendor.createDatabase, couchUtils.DB_TYPE_TEST)
                .then(cycleRepositoryVendor.load)
                .then(checkForSuccessfulDatabaseCreation)
                .then(function(result){
                    return expect(result).to.be.true;
                });


            function checkForSuccessfulDatabaseCreation(loadedCycle){
                var result = Q.defer();

                request(storeOptions.privilegedCouchDbUrl + '/' + loadedCycle.getDatabaseName(), function (error, response, body) {
                    if ( response.statusCode === 200){
                        result.resolve(true);
                    }
                    else {
                        result.resolve(false);
                    }
                });

                return result.promise;
            }
        });
    });
});

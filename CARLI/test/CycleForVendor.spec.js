var chai = require('chai');
var expect = chai.expect;
//var chaiAsPromised = require('chai-as-promised');
var cycleRepositoryCarli = require('../Entity/CycleRepository');
var cycleRepositoryForVendor = require('../Entity/CycleRepositoryForVendor');
var testUtils = require('./utils');
var Q = require('q');

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
                return expect(loadedCycle.getDatabaseName('1234')).to.equal(loadedCycle.databaseName + '-1234');
            });
    });

    it('should include only cycles open to vendors from listActiveCycles', function() {
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

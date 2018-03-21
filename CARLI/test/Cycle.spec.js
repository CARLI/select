var chai = require( 'chai' );
var config = require('../../config');
var cycleRepository = require( '../Entity/CycleRepository' );
var Entity = require('../Entity');
var expect = chai.expect;
var productRepository = require( '../Entity/ProductRepository' );
var request = require('request');
var storeOptions = config.storeOptions;
var testUtils = require('./utils');
var test = require( './Entity/EntityInterface.spec' );
var uuid = require( 'node-uuid' );

var Q = require('q');

testUtils.setupTestDb();

var uniqueCycleNameSuffix = 3000;
function validCycleData() {
    uniqueCycleNameSuffix++;
    return {
        type: 'Cycle', 
        name: testUtils.testDbMarker + ' Fiscal Year ' + uniqueCycleNameSuffix,
        cycleType: 'Fiscal Year',
        year: 3001,
        status: 0,
        isArchived: false
    };
}

function invalidCycleData() {
    return {
        type: 'Cycle'
    };
}

test.run('Cycle', validCycleData, invalidCycleData);

describe('Cycle Status string constants', function(){
    it('should export variables', function() {
        expect(cycleRepository.CYCLE_STATUS_DATA_PROCESSING).to.not.be.undefined;
        expect(cycleRepository.CYCLE_STATUS_EDITING_PRODUCT_LIST).to.be.ok;
        expect(cycleRepository.CYCLE_STATUS_VENDOR_PRICING).to.be.ok;
        expect(cycleRepository.CYCLE_STATUS_CHECKING_PRICES).to.be.ok;
        expect(cycleRepository.CYCLE_STATUS_OPEN_TO_LIBRARIES).to.be.ok;
        expect(cycleRepository.CYCLE_STATUS_CLOSED).to.be.ok;
        expect(cycleRepository.CYCLE_STATUS_ARCHIVED).to.be.ok;
    });
});

describe('Additional Repository Functions', function() {
    describe('createCycle', function () {
        //'it' refers to the test.run() block above. At least one of those should have created a cycle DB
        it('should have created a new couch database', function(done) {
            request(storeOptions.privilegedCouchDbUrl + '/cycle-'+ testUtils.testDbMarker +'-fiscal-year-' + uniqueCycleNameSuffix,  function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
        it ('should have saved the databaseName to the cycle document', function () {
            return cycleRepository.list().then(function(cycleList) {
                function allCyclesHaveDatabaseName(cycles) {
                    var result = true;
                    cycles.forEach(function (cycle) {
                        if (!cycle.hasOwnProperty('databaseName')) {
                            result = false;
                        }
                    });
                    return result;
                }
                return expect(cycleList).to.satisfy( allCyclesHaveDatabaseName );
            });
        });
    });

    describe('listActiveCycles View', function () {
        it('should have a listActiveCycles method', function(){
            expect(cycleRepository.listActiveCycles).to.be.a('function');
        });

        var cycle1 = validCycleData();
        var cycle2 = validCycleData();
        cycle2.status = 3;
        var cycle3 = validCycleData();
        cycle3.isArchived = true;

        it('should return Cycles that are not archived');
        /* This test would depend on starting with no cycles in the database, which is not currently the case */
        /*
         function(){
         return cycleRepository.create( cycle1 )
         .then( function() {
         return cycleRepository.create( cycle2 );
         })
         .then (function () {
         return cycleRepository.create( cycle3 );
         })
         .then(function(){
         return cycleRepository.listActiveCycles();
         })
         .then(function ( cycleList ) {
         return expect(cycleList).to.be.an('array').and.have.length(2);
         });
         */
    });

    describe('listPastFourCyclesMatchingCycle', function() {
        it('should be a function', function(){
            expect(cycleRepository.listPastFourCyclesMatchingCycle).to.be.a('function');
        });

        it('should return up to four past cycles that match the type of the cycle passed in', function(){
            var testCycleType = 'Alternative Cycle';
            var testYear = 2004;

            var pastCycles = [
                makeCycle(testCycleType, testYear - 5),
                makeCycle(testCycleType, testYear - 4),
                makeCycle(testCycleType, testYear - 3),
                makeCycle(testCycleType, testYear - 2),
                makeCycle(testCycleType, testYear - 1)
            ];
            var testCycle = makeCycle(testCycleType, testYear);

            return setupTestData(pastCycles)
                .then(function(){
                    return cycleRepository.listPastFourCyclesMatchingCycle(testCycle);
                })
                .then(function(listResults){
                    return Q.all([
                        expect(listResults.length).to.equal(4),
                        expect(listResults).to.satisfy(allCyclesHaveCorrectTypeAndYear)
                    ]);
                });

            function allCyclesHaveCorrectTypeAndYear(cycleList){
                return cycleList.every(cycleHasCorrectType) && cycleList.every(cycleHasCorrectYear);

                function cycleHasCorrectYear(cycle){
                    return cycle.year < testYear && cycle.year >= (testYear - 4);
                }

                function cycleHasCorrectType(cycle){
                    return cycle.cycleType === testCycleType;
                }
            }
        });

        function makeCycle(type, year){
            var cycle = validCycleData();
            cycle.cycleType = type;
            cycle.year = year;
            cycle.name = 'Test Cycle for Past Cycle Matching Basic ' + uuid.v4();
            return cycle;
        }

        function setupTestData(testCycles){
            var cycleEntityRepo = Entity('Cycle');
            cycleEntityRepo.setStore(testUtils.getTestDbStore());
            return Q.all( testCycles.map(cycleEntityRepo.create));
        }
    });

    describe('the getStatusLabel repository function', function(){
        it('should be a function', function(){
            expect(cycleRepository.getStatusLabel).to.be.a('function');
        });

        it('should return the text status label for a cycle status value', function(){
            expect(cycleRepository.getStatusLabel(cycleRepository.CYCLE_STATUS_DATA_PROCESSING)).to.equal('Cycle Data Processing');
            expect(cycleRepository.getStatusLabel(cycleRepository.CYCLE_STATUS_CHECKING_PRICES)).to.equal('CARLI Checking Prices');
            expect(cycleRepository.getStatusLabel(cycleRepository.CYCLE_STATUS_ARCHIVED)).to.equal('Archived');
        });
    });
});

describe('Adding functions to Cycle instances', function() {

    it('should add functions to cycle instances', function () {
        var cycle = validCycleData();

        return cycleRepository.create(cycle)
            .then(function (cycleId) {
                return cycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return Q.all([
                    expect(loadedCycle.getStatusLabel).to.be.a('function'),
                    expect(loadedCycle.proceedToNextStep).to.be.a('function'),
                    expect(loadedCycle.returnToPreviousStep).to.be.a('function'),
                    expect(loadedCycle.getCycleSelectionAndInvoiceTotals).to.be.a('function')
                ]);
            });
    });


    it('should add a getStatusLabel method to instances of Cycle', function () {
        var cycle = validCycleData();

        return cycleRepository.create(cycle)
            .then(function (cycleId) {
                return cycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.getStatusLabel).to.be.a('function');
            });
    });

    describe('the Cycle.getStatusLabel method', function () {
        it('should return the label for the cycles current status', function () {
            var cycle = validCycleData();

            return cycleRepository.create(cycle)
                .then(function (cycleId) {
                    return cycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    return expect(loadedCycle.getStatusLabel()).to.equal('Cycle Data Processing');
                });
        });

        it('should return "Archived" for an archived cycle regardless of status', function(){
            var cycle = validCycleData();
            cycle.status = 2;
            cycle.isArchived = true;

            return cycleRepository.create(cycle)
                .then(function (cycleId) {
                    return cycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    return expect(loadedCycle.getStatusLabel()).to.equal('Archived');
                });
        });
    });

    it('should add a proceedToNextStep method to instances of Cycle', function(){
        var cycle = validCycleData();

        return cycleRepository.create(cycle)
            .then(function (cycleId) {
                return cycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.proceedToNextStep).to.be.a('function');
            });
    });

    describe('the Cycle.proceedToNextStep method', function () {
        it('should increment the status for the cycle', function () {
            var cycle = validCycleData();

            return cycleRepository.create(cycle)
                .then(function (cycleId) {
                    return cycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.proceedToNextStep();
                    return expect(loadedCycle.status).to.equal(1);
                });
        });

        it('should not increment the status past 6', function () {
            var cycle = validCycleData();
            cycle.status = 6;

            return cycleRepository.create(cycle)
                .then(function (cycleId) {
                    return cycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.proceedToNextStep();
                    return expect(loadedCycle.status).to.equal(6);
                });
        });
    });

    it('should add a returnToPreviousStep method to instances of Cycle', function(){
        var cycle = validCycleData();

        return cycleRepository.create(cycle)
            .then(function (cycleId) {
                return cycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.returnToPreviousStep).to.be.a('function');
            });
    });

    describe('the Cycle.returnToPreviousStep method', function () {
        it('should decrement the status for the cycle', function () {
            var cycle = validCycleData();
            cycle.status = 4;

            return cycleRepository.create(cycle)
                .then(function (cycleId) {
                    return cycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.returnToPreviousStep();
                    return expect(loadedCycle.status).to.equal(3);
                });
        });

        it('should not decrement the status less than 0', function () {
            var cycle = validCycleData();

            return cycleRepository.create(cycle)
                .then(function (cycleId) {
                    return cycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.returnToPreviousStep();
                    return expect(loadedCycle.status).to.equal(0);
                });
        });
    });

    describe('the Cycle.getDatabaseName method', function () {
        it('should return a database name', function () {
            var cycle = validCycleData();

            return cycleRepository.create(cycle)
                .then(cycleRepository.load)
                .then(function (loadedCycle) {
                    return expect(loadedCycle.getDatabaseName()).to.equal(loadedCycle.databaseName);
                });
        });
    });
});

describe('the isOpenToLibraries method', function(){
    it('should return true for cycles in the "Libraries Selecting Products" state', function(){
        var testCycle = validCycleData();
        testCycle.status = 4;

        expect(cycleRepository.isOpenToLibraries(testCycle)).to.be.true;
    });

    it('should return false for any other status', function(){
        var testCycle = validCycleData();
        expect(cycleRepository.isOpenToLibraries(testCycle)).to.be.false;

        testCycle.status = 1;
        expect(cycleRepository.isOpenToLibraries(testCycle)).to.be.false;

        testCycle.status = 2;
        expect(cycleRepository.isOpenToLibraries(testCycle)).to.be.false;

        testCycle.status = 3;
        expect(cycleRepository.isOpenToLibraries(testCycle)).to.be.false;

        testCycle.status = 5;
        expect(cycleRepository.isOpenToLibraries(testCycle)).to.be.false;
    });
});

describe('the isClosed method', function(){
    it('should return true for cycles in the "Selections Made" state', function(){
        var testCycle = validCycleData();
        testCycle.status = 5;

        expect(cycleRepository.isClosed(testCycle)).to.be.true;
    });

    it('should return false for any other status', function(){
        var testCycle = validCycleData();
        expect(cycleRepository.isClosed(testCycle)).to.be.false;

        testCycle.status = 1;
        expect(cycleRepository.isClosed(testCycle)).to.be.false;

        testCycle.status = 2;
        expect(cycleRepository.isClosed(testCycle)).to.be.false;

        testCycle.status = 3;
        expect(cycleRepository.isClosed(testCycle)).to.be.false;

        testCycle.status = 4;
        expect(cycleRepository.isClosed(testCycle)).to.be.false;
    });
});

describe('the productsAreAvailable method', function(){
    it('should return true if today is equal to after the cycle end date', function(){
        var testCycle = validCycleData();
        testCycle.productsAvailableDate = '2000-01-01';
        expect(cycleRepository.productsAreAvailable(testCycle)).to.be.true;
    });

    it('should return false if today is before the end date', function(){
        var testCycle = validCycleData();
        testCycle.productsAvailableDate = '3000-11-31';
        expect(cycleRepository.productsAreAvailable(testCycle)).to.be.false;
    });
});

describe('the fiscalYearHasStartedForDate method', function(){
    it('should return false if the date is before the start of the fiscal year', function(){
        var testDate = '2010-05-01';
        expect(cycleRepository.fiscalYearHasStartedForDate(testDate)).to.equal(false);
    });

    it('should return true if the date is on or after the start of the fiscal year', function(){
        var testDate = '2010-07-15';
        expect(cycleRepository.fiscalYearHasStartedForDate(testDate)).to.equal(true);
    });
});

describe('listAllDatabaseNamesForCycle', function () {
    it('should be a function', function () {
        expect(cycleRepository.listAllDatabaseNamesForCycle).to.be.a('function');
    });

    it('should return an array containing the database name for a cycle object', function () {
        var cycle = {
            id: 'test-cycle-id',
            databaseName: 'my-database-name',
            cycleType: 'Alternative Cycle',
            year: 2049,
            status: 1,
            isArchived: false
        };

        var expectedResults = ['my-database-name'];

        expect(cycleRepository.listAllDatabaseNamesForCycle(cycle)).to.deep.equal(expectedResults);
    });

    it('should return an array containing the database names for a cycle and vendor shards, given a list of vendors', function () {
        var cycle = {
            id: 'test-cycle-id',
            databaseName: 'my-database-name',
            cycleType: 'Alternative Cycle',
            year: 2049,
            status: 1,
            isArchived: false
        };

        var listOfVendors = [
            {
                id: '0001',
                name: 'vendor1'
            },
            {
                id: '0002',
                name: 'vendor2'
            },
            {
                id: '0003',
                name: 'vendor3'
            }
        ];

        var expectedResults = [
            'my-database-name',
            'my-database-name-0001',
            'my-database-name-0002',
            'my-database-name-0003'
        ];

        expect(cycleRepository.listAllDatabaseNamesForCycle(cycle, listOfVendors)).to.deep.equal(expectedResults);
    });
});
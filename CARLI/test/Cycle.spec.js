var test = require( './Entity/EntityInterface.spec' )
    , chai = require( 'chai' )
    , expect = chai.expect
    , uuid = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , CycleRepository = require( '../Entity/CycleRepository' )
    , ProductRepository = require( '../Entity/ProductRepository' )
    , config = require('../../config')
    , request = require('../../config/environmentDependentModules/request')
    , storeOptions = config.storeOptions
    , testUtils = require('./utils')
    , Q = require('q')
;

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

describe('Additional Repository Functions', function() {
    describe('createCycle', function () {
        //'it' refers to the test.run() block above. At least one of those should have created a cycle DB
        it('should have created a new couch database', function(done) {
            request(storeOptions.couchDbUrl + '/cycle-'+ testUtils.testDbMarker +'-fiscal-year-' + uniqueCycleNameSuffix,  function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
        it ('should have saved the databaseName to the cycle document', function () {
            return CycleRepository.list().then(function(cycleList) {
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

    describe('createCycleFrom', function(){
        it('should copy cycle contents from the specified cycle db', function(){
            var sourceCycleData = validCycleData();
            var sourceCycle = null;
            var productId = uuid.v4();

            var newCycleData = validCycleData();
            newCycleData.name = 'Copy of ' + sourceCycleData.name;

            return CycleRepository.create(sourceCycleData)
                .then(CycleRepository.load)
                .then(function(loadedCycle){
                    //noinspection ReuseOfLocalVariableJS
                    sourceCycle = loadedCycle;
                    var productData = {
                        id: productId,
                        name: 'Copy Cycle Test Product',
                        type: "Product",
                        vendor: 'bogus',
                        cycle: sourceCycle
                    };

                    return ProductRepository.create( productData, sourceCycle);
                })
                .then(function(){
                    return CycleRepository.createCycleFrom(sourceCycle, newCycleData);
                })
                .then(CycleRepository.load)
                .then(function(newCycle){
                    return expect(ProductRepository.load(productId, newCycle)).to.be.fulfilled;
                });
        });

    });

    describe('listActiveCycles View', function () {
        it('should have a listActiveCycles method', function(){
            expect(CycleRepository.listActiveCycles).to.be.a('function');
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
         return CycleRepository.create( cycle1 )
         .then( function() {
         return CycleRepository.create( cycle2 );
         })
         .then (function () {
         return CycleRepository.create( cycle3 );
         })
         .then(function(){
         return CycleRepository.listActiveCycles();
         })
         .then(function ( cycleList ) {
         return expect(cycleList).to.be.an('array').and.have.length(2);
         });
         */
    });
});

describe('Adding functions to Cycle instances', function() {

    it('should add functions to cycle instances', function () {
        var cycle = validCycleData();

        return CycleRepository.create(cycle)
            .then(function (cycleId) {
                return CycleRepository.load(cycleId);
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

        return CycleRepository.create(cycle)
            .then(function (cycleId) {
                return CycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.getStatusLabel).to.be.a('function');
            });
    });

    describe('the Cycle.getStatusLabel method', function () {
        it('should return the label for the cycles current status', function () {
            var cycle = validCycleData();

            return CycleRepository.create(cycle)
                .then(function (cycleId) {
                    return CycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    return expect(loadedCycle.getStatusLabel()).to.equal('CARLI Editing Product List');
                });
        });

        it('should return "Archived" for an archived cycle regardless of status', function(){
            var cycle = validCycleData();
            cycle.status = 2;
            cycle.isArchived = true;

            return CycleRepository.create(cycle)
                .then(function (cycleId) {
                    return CycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    return expect(loadedCycle.getStatusLabel()).to.equal('Archived');
                });
        });
    });

    it('should add a proceedToNextStep method to instances of Cycle', function(){
        var cycle = validCycleData();

        return CycleRepository.create(cycle)
            .then(function (cycleId) {
                return CycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.proceedToNextStep).to.be.a('function');
            });
    });

    describe('the Cycle.proceedToNextStep method', function () {
        it('should increment the status for the cycle', function () {
            var cycle = validCycleData();

            return CycleRepository.create(cycle)
                .then(function (cycleId) {
                    return CycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.proceedToNextStep();
                    return expect(loadedCycle.status).to.equal(1);
                });
        });

        it('should not increment the status past 5', function () {
            var cycle = validCycleData();
            cycle.status = 5;

            return CycleRepository.create(cycle)
                .then(function (cycleId) {
                    return CycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.proceedToNextStep();
                    return expect(loadedCycle.status).to.equal(5);
                });
        });
    });

    it('should add a returnToPreviousStep method to instances of Cycle', function(){
        var cycle = validCycleData();

        return CycleRepository.create(cycle)
            .then(function (cycleId) {
                return CycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.returnToPreviousStep).to.be.a('function');
            });
    });

    describe('the Cycle.returnToPreviousStep method', function () {
        it('should decrement the status for the cycle', function () {
            var cycle = validCycleData();
            cycle.status = 4;

            return CycleRepository.create(cycle)
                .then(function (cycleId) {
                    return CycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.returnToPreviousStep();
                    return expect(loadedCycle.status).to.equal(3);
                });
        });

        it('should not decrement the status less than 0', function () {
            var cycle = validCycleData();

            return CycleRepository.create(cycle)
                .then(function (cycleId) {
                    return CycleRepository.load(cycleId);
                })
                .then(function (loadedCycle) {
                    loadedCycle.returnToPreviousStep();
                    return expect(loadedCycle.status).to.equal(0);
                });
        });
    });

    it('should add a getViewUpdateStatus method to instances of Cycle', function(){
        var cycle = validCycleData();

        return CycleRepository.create(cycle)
            .then(function (cycleId) {
                return CycleRepository.load(cycleId);
            })
            .then(function (loadedCycle) {
                return expect(loadedCycle.getViewUpdateStatus).to.be.a('function');
            });
    });
});

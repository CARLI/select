var test = require( './Entity/EntityInterface.spec' )
    , chai = require( 'chai' )
    , expect = chai.expect
    , uuid = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , CycleRepository = require( '../Entity/CycleRepository' )
    , config = require('../config')
    , request = config.request
    , storeOptions = config.storeOptions
;

var lastValidCycleYear = 3000;
function validCycleData() {
    lastValidCycleYear++;
    return {
        type: 'Cycle', 
        name: 'carli-test Fiscal Year ' + lastValidCycleYear,
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
        it ('should have created a new couch database', function(done) {
            request(storeOptions.couchDbUrl + '/cycle-carli-test-fiscal-year-' + lastValidCycleYear,  function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
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

    describe('the Cycle.getIsActive method', function () {
        it('should return true for an active Product with an active Vendor', function () {
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
});

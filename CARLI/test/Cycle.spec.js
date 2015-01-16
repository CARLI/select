var test = require( './Entity/EntityInterface.spec' )
    , chai = require( 'chai' )
    , expect = chai.expect
    , uuid = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , CycleRepository = require( '../Entity/CycleRepository' )
;

function validCycleData() {
    return {
        type: 'Cycle', 
        name: 'Fiscal Year 3001',
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

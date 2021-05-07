var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , libraryStatusRepository = require('../Entity/LibraryStatusRepository' )
    , testUtils = require('./utils')
    , _ = require('lodash')
    , Q = require('q')
    ;

var testCycleId = uuid.v4();

function validLibraryStatusData() {
    return {
        type: 'LibraryStatus',
        id: uuid.v4(),
        library: uuid.v4(),
        cycle: testCycleId
    };
}
function invalidLibraryStatus() {
    return {
        type: 'LibraryStatus'
    };
}

function testCycleData() {
    return {
        id: testCycleId,
        idalId: 200,
        name: testUtils.testDbMarker + ' LibraryStatus Tests 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    };
}

//TODO: Try removing done() and see if the test still works
describe('Run the LibraryStatus tests', function () {
    let testCycle;

    before(async () => {
        const cycleId = await CycleRepository.create(testCycleData());
        testCycle = await CycleRepository.load(cycleId);

        test.run('LibraryStatus', validLibraryStatusData, invalidLibraryStatus, testCycle);
    });

    describe('getStatusForLibrary', function () {
        it('should return the LibraryStatus document for a specific Library', function () {
            var testLibraryId = uuid.v4();
            var testLibraryStatus = validLibraryStatusData();
            testLibraryStatus.library = testLibraryId;

            return libraryStatusRepository.create(testLibraryStatus, testCycle)
                .then(function () {
                    return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
                })
                .then(function (statusForLibrary) {
                    return expect(statusForLibrary.library).to.equal(testLibraryId);
                });
        });

        it(`should return a new LibraryStatus document for the given cycle if there are no statuses for the given cycle`, async () => {
            var testLibraryId = uuid.v4();
            var testLibraryStatus = validLibraryStatusData();
            testLibraryStatus.library = testLibraryId;
            testLibraryStatus.cycle = "clearly-wrong-cycle-id";
            await libraryStatusRepository.create(testLibraryStatus, testCycle);

            const statusForLibrary = await libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
            return expect(statusForLibrary.cycle).to.equal(testCycleId);
        });

        it('should ensure default values on the LibraryStatus document', function () {
            var testLibraryId = uuid.v4();
            var testLibraryStatus = validLibraryStatusData();

            return libraryStatusRepository.create(testLibraryStatus, testCycle)
                .then(function () {
                    return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
                })
                .then(function (statusForLibrary) {
                    return Q.all([
                        expect(statusForLibrary.cycle).to.equal(testCycleId),
                        expect(statusForLibrary.library).to.equal(testLibraryId),
                        expect(statusForLibrary.isComplete).to.equal(false)
                    ]);
                });
        });

        it('should return a default LibraryStatus object for a Library that does not have a LibraryStatus document already', function () {
            var testLibraryId = uuid.v4();

            return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle)
                .then(function (statusForLibrary) {
                    return Q.all([
                        expect(statusForLibrary.library).to.equal(testLibraryId),
                        expect(statusForLibrary.lastActivity).to.be.an('undefined'),
                        expect(statusForLibrary.isComplete).to.equal(false)
                    ]);
                });
        });

        describe('marking a library status "selections complete"', function () {
            it('should create a new status document if one does not already exist', function () {
                var testLibraryId = uuid.v4();

                return libraryStatusRepository.markLibrarySelectionsComplete(testLibraryId, testCycle)
                    .then(function () {
                        return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
                    })
                    .then(function (statusForLibrary) {
                        return Q.all([
                            expect(statusForLibrary.id).to.be.ok,
                            expect(statusForLibrary.library).to.equal(testLibraryId),
                            expect(statusForLibrary.isComplete).to.equal(true)
                        ]);
                    });
            });

            it('should update an existing status document if there is one ', function () {
                var testLibraryId = uuid.v4();
                var testLibraryStatus = validLibraryStatusData();
                testLibraryStatus.library = testLibraryId;

                return libraryStatusRepository.create(testLibraryStatus, testCycle)
                    .then(function () {
                        return libraryStatusRepository.markLibrarySelectionsComplete(testLibraryId, testCycle);
                    })
                    .then(function () {
                        return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
                    })
                    .then(function (statusForLibrary) {
                        return Q.all([
                            expect(statusForLibrary.id).to.be.ok,
                            expect(statusForLibrary.library).to.equal(testLibraryId),
                            expect(statusForLibrary.isComplete).to.equal(true)
                        ]);
                    });
            });
        });

        describe('marking a library status "selections incomplete"', function () {
            it('should create a new status document if one does not already exist', function () {
                var testLibraryId = uuid.v4();

                return libraryStatusRepository.markLibrarySelectionsIncomplete(testLibraryId, testCycle)
                    .then(function () {
                        return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
                    })
                    .then(function (statusForLibrary) {
                        return Q.all([
                            expect(statusForLibrary.id).to.be.ok,
                            expect(statusForLibrary.library).to.equal(testLibraryId),
                            expect(statusForLibrary.isComplete).to.equal(false)
                        ]);
                    });
            });

            it('should update an existing status document if there is one ', function () {
                var testLibraryId = uuid.v4();
                var testLibraryStatus = validLibraryStatusData();
                testLibraryStatus.library = testLibraryId;

                return libraryStatusRepository.create(testLibraryStatus, testCycle)
                    .then(function () {
                        return libraryStatusRepository.markLibrarySelectionsIncomplete(testLibraryId, testCycle);
                    })
                    .then(function () {
                        return libraryStatusRepository.getStatusForLibrary(testLibraryId, testCycle);
                    })
                    .then(function (statusForLibrary) {
                        return Q.all([
                            expect(statusForLibrary.id).to.be.ok,
                            expect(statusForLibrary.library).to.equal(testLibraryId),
                            expect(statusForLibrary.isComplete).to.equal(false)
                        ]);
                    });
            });
        });
    });

    describe('getStatusesForAllLibraries', function () {
        it('should return the LibraryStatus documents for all Libraries, mapped by id', function () {
            var testLibraryId = uuid.v4();
            var testLibraryStatus = validLibraryStatusData();
            testLibraryStatus.library = testLibraryId;

            return libraryStatusRepository.create(testLibraryStatus, testCycle)
                .then(function () {
                    return libraryStatusRepository.getStatusesForAllLibraries(testCycle);
                })
                .then(function (statusesForAllLibraries) {
                    return Q.all([
                        expect(statusesForAllLibraries).to.be.an('object'),
                        expect(statusesForAllLibraries[testLibraryId]).to.be.an('object'),
                        expect(statusesForAllLibraries[testLibraryId]).to.have.property('type', 'LibraryStatus')
                    ]);
                });
        });
    });
});

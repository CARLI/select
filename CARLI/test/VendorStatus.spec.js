var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , vendorStatusRepository = require('../Entity/VendorStatusRepository' )
    , testUtils = require('./utils')
    , _ = require('lodash')
    , Q = require('q')
    ;

var testCycleId = uuid.v4();

function validVendorStatusData() {
    return {
        type: 'VendorStatus',
        id: uuid.v4(),
        vendor: uuid.v4(),
        cycle: testCycleId
    };
}
function invalidVendorStatus() {
    return {
        type: 'VendorStatus'
    };
}

function testCycleData() {
    return {
        id: testCycleId,
        idalId: 200,
        name: testUtils.testDbMarker + ' VendorStatus Tests 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    };
}


describe('Run the VendorStatus tests', function () {
    it ('runs VendorStatus tests', function () {
        return CycleRepository.create(testCycleData())
            .then(CycleRepository.load)
            .then(function (testCycle) {
                test.run('VendorStatus', validVendorStatusData, invalidVendorStatus, testCycle);
                runVendorStatusSpecificTests(testCycle);
            });
    });
});


function runVendorStatusSpecificTests(testCycle) {
    describe('getStatusForVendor', function(){
        it('should return the VendorStatus document for a specific Vendor', function(){
            var testVendorId = uuid.v4();
            var testVendorStatus = validVendorStatusData();
            testVendorStatus.vendor = testVendorId;

            return vendorStatusRepository.create(testVendorStatus, testCycle)
                .then(function(){
                    return vendorStatusRepository.getStatusForVendor(testVendorId, testCycle);
                })
                .then(function( statusForVendor ){
                    return expect(statusForVendor.vendor).to.equal(testVendorId);
                });
        });

        it('should ensure default values on the VendorStatus document', function(){
            var testVendorId = uuid.v4();
            var testActivity = uuid.v4();
            var testVendorStatus = validVendorStatusData();
            testVendorStatus.vendor = testVendorId;
            testVendorStatus.lastActivity = testActivity;
            testVendorStatus.checklist = {
                simultaneousUsers: true
            };

            return vendorStatusRepository.create(testVendorStatus, testCycle)
                .then(function(){
                    return vendorStatusRepository.getStatusForVendor(testVendorId, testCycle);
                })
                .then(function( statusForVendor ){
                    return Q.all([
                        expect(statusForVendor.cycle).to.equal(testCycleId),
                        expect(statusForVendor.vendor).to.equal(testVendorId),
                        expect(statusForVendor.lastActivity).to.equal(testActivity),
                        expect(statusForVendor.description).to.equal('No Activity'),
                        expect(statusForVendor.isClosed).to.equal(false),
                        expect(statusForVendor.flaggedOfferingsCount).to.equal(0),
                        expect(statusForVendor.flaggedOfferingsReasons).to.be.empty,
                        expect(statusForVendor.progress).to.equal(0),
                        expect(statusForVendor.checklist.siteLicense).to.equal(false),
                        expect(statusForVendor.checklist.simultaneousUsers).to.equal(true),
                        expect(statusForVendor.checklist.descriptions).to.equal(false)
                    ]);
                });
        });

        it('should return a default VendorStatus object for a Vendor that does not have a VendorStatus document already', function(){
            var testVendorId = uuid.v4();

            return vendorStatusRepository.getStatusForVendor(testVendorId, testCycle)
                .then(function( statusForVendor ){
                    return Q.all([
                        expect(statusForVendor.vendor).to.equal(testVendorId),
                        expect(statusForVendor.lastActivity).to.be.an('undefined'),
                        expect(statusForVendor.checklist.siteLicense).to.equal(false)
                    ]);
                });
        });
    });

   describe('ensureStatusExistsForVendor', function(){
        it('should create a new VendorStatus document for a specific Vendor or return the existing document id', function(){
            var testVendorId = uuid.v4();

            return vendorStatusRepository.ensureStatusExistsForVendor(testVendorId, testCycle)
                .then(function(){
                    return vendorStatusRepository.getStatusForVendor(testVendorId, testCycle);
                })
                .then(function( statusForVendor ){
                    return expect(statusForVendor.vendor).to.equal(testVendorId);
                });
        });
    });

    describe('resetStatusForVendor', function(){
        it('should reset the values of a VendorStatus document for a new cycle', function(){
            var testVendorStatus = validVendorStatusData();
            testVendorStatus.lastActivity = '2015-01-01';
            testVendorStatus.description = 'did some pricing';
            testVendorStatus.isClosed = true;
            testVendorStatus.offeringFlaggedCount = 11;

            vendorStatusRepository.reset( testVendorStatus );

            expect(testVendorStatus.lastActivity).to.be.a('null');
            expect(testVendorStatus.description).to.equal('No Activity');
            expect(testVendorStatus.isClosed).to.equal(false);
            expect(testVendorStatus.flaggedOfferingsCount).to.equal(0);
            expect(testVendorStatus.flaggedOfferingsReasons).to.be.empty;
            expect(testVendorStatus.progress).to.equal(0);
            expect(testVendorStatus.checklist.siteLicense).to.equal(false);
            expect(testVendorStatus.checklist.simultaneousUsers).to.equal(false);
            expect(testVendorStatus.checklist.descriptions).to.equal(false);

        });
    });
}

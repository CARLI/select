var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , OfferingRepository = require('../Entity/OfferingRepository' )
    , testUtils = require('./utils')
    ;

chai.use( chaiAsPromised );

var testCycleId = uuid.v4();

function validOfferingData() {
    return {
        type: 'Offering',
        cycle: { id: testCycleId },
        library: { id: uuid.v4() },
        product: { id: uuid.v4() },
        pricing: {
            site: 1200,
            su: [{
                users: 2,
                price: 700
            }]
        }
    };
}
function invalidOfferingData() {
    return {
        type: 'Offering'
    };
}
function testCycleData() {
    return {
        id: testCycleId,
        idalId: 200,
        name: testUtils.testDbMarker + ' Offering Tests',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        OfferingsAvailableDate: '2014-01-01'
    };
}

describe('Run the Offering tests', function () {
    it ('runs Offering tests', function (done) {
        return CycleRepository.create(testCycleData())
            .then(CycleRepository.load)
            .then(function (testCycle) {
                test.run('Offering', validOfferingData, invalidOfferingData, testCycle);
                runOfferingSpecificTests(testCycle);
                done();
            }).done();
    });
});


function runOfferingSpecificTests(testCycle) {
    describe('Offering Specific Tests', function () {
        describe('listOfferingsForProductId View', function () {
            it('should have a listOfferingsForProductId method', function () {
                expect(OfferingRepository.listOfferingsForProductId).to.be.a('function');
            });

            it('should list offerings for a specific product');
        });

        describe('Adding functions to Offerings instances', function () {
            it('should add a getFlaggedState method to instances of Offerings', function() {
                return OfferingRepository.create(validOfferingData(),testCycle)
                    .then(function(offeringId){
                        return OfferingRepository.load(offeringId,testCycle);
                    })
                    .then(function(offering){
                        return expect(offering.getFlaggedState).to.be.a('function');
                    });
            });

            it('should return true if the offering has property set to true', function() {
                var testOffering = validOfferingData();
                testOffering.flagged = true;

                return OfferingRepository.create(testOffering,testCycle)
                    .then(function(offeringId){
                        return OfferingRepository.load(offeringId,testCycle);
                    })
                    .then(function(offering){
                        return expect(offering.getFlaggedState()).to.equal(true);
                    });
            });

            it('should return false if the offering has property set to false', function() {
                var testOffering = validOfferingData();
                testOffering.flagged = false;

                return OfferingRepository.create(testOffering,testCycle)
                    .then(function(offeringId){
                        return OfferingRepository.load(offeringId,testCycle);
                    })
                    .then(function(offering){
                        return expect(offering.getFlaggedState()).to.equal(false);
                    });
            });

            it('should compute false if the offering has valid pricing data', function() {
                var testOffering = validOfferingData();

                return OfferingRepository.create(testOffering,testCycle)
                    .then(function(offeringId){
                        return OfferingRepository.load(offeringId,testCycle);
                    })
                    .then(function(offering){
                        return expect(offering.getFlaggedState()).to.equal(false);
                    });
            });

            it('should compute true if the offering has an su price great than the site license price', function() {
                var testOffering = validOfferingData();
                testOffering.pricing = {
                    site: 1000,
                    su: [{
                        users: 2,
                        price: 2000
                    }]
                };

                return OfferingRepository.create(testOffering,testCycle)
                    .then(function(offeringId){
                        return OfferingRepository.load(offeringId,testCycle);
                    })
                    .then(function(offering){
                        return expect(offering.getFlaggedState()).to.equal(true);
                    });
            });
        });


    });
}

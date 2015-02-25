var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , OfferingRepository = require('../Entity/OfferingRepository' )
    , ProductRepository = require('../Entity/ProductRepository' )
    , testUtils = require('./utils')
    , _ = require('lodash')
    ;

chai.use( chaiAsPromised );

var testCycleId = uuid.v4();

function validOfferingData() {
    return {
        type: 'Offering',
        cycle: { id: testCycleId },
        library: { id: "1" },
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

        describe('Expanding referenced entities on load', function () {

            var testOffering = validOfferingData();
            testOffering.id = 'my-test-id';

            var testProduct = {id: testOffering.product.id, cycle: testCycle, type: "Product", name: "offering test product name", vendor: uuid.v4() };

            it('should expand references to products and libraries in Offerings', function () {
                var loadedOffering;

                return ProductRepository.create(testProduct, testCycle)
                    .then(function() {
                        return OfferingRepository.create(testOffering, testCycle);
                    })
                    .then(function( offeringId ){
                        return OfferingRepository.load(offeringId, testCycle);
                    })
                    .then(function (loadedOfferingData) {
                        loadedOffering = loadedOfferingData;

                        console.log('LOADED OFFERING ',loadedOffering);

                        return expect(loadedOffering.library).to.be.an('object').and.have.property('name');
                    })
                    .then(function () {
                        return expect(loadedOffering.product).to.be.an('object').and.have.property('name');
                    });
            });
        });

        describe('listOfferingsForLibraryId View', function () {
            it('should have a listOfferingsForLibraryId method', function () {
                expect(OfferingRepository.listOfferingsForLibraryId).to.be.a('function');
            });

            it('should list offerings for a specific library');
        });
        describe('listOfferingsForProductId View', function () {
            it('should have a listOfferingsForProductId method', function () {
                expect(OfferingRepository.listOfferingsForProductId).to.be.a('function');
            });

            it('should list offerings for a specific product');
        });

        describe('transformOfferingForNewCycle', function() {
            it('should copy the pricing data to a history property and preserve past history if it exists', function() {
                var originalOffering = validOfferingData();
                originalOffering.cycle = _.clone(testCycle);
                originalOffering.cycle.year = 2014;

                var transformedOffering = OfferingRepository.transformOfferingForNewCycle(originalOffering);
                expect(transformedOffering.history['2014'].pricing).to.deep.equal(originalOffering.pricing);

                transformedOffering.cycle = _.clone(testCycle);
                transformedOffering.cycle.year = 2015;

                transformedOffering = OfferingRepository.transformOfferingForNewCycle(transformedOffering);
                expect(transformedOffering.history['2014'].pricing).to.deep.equal(originalOffering.pricing);
                expect(transformedOffering.history['2015'].pricing).to.deep.equal(originalOffering.pricing);

            });
            it('should copy the selection data to a history property and preserve past history if it exists', function() {
                var originalOffering = validOfferingData();
                originalOffering.cycle = _.clone(testCycle);
                originalOffering.cycle.year = 2014;
                originalOffering.selection = { foo: 'bar' };

                var transformedOffering = OfferingRepository.transformOfferingForNewCycle(originalOffering);
                expect(transformedOffering.history['2014'].selection).to.deep.equal(originalOffering.selection);

                transformedOffering.cycle = _.clone(testCycle);
                transformedOffering.cycle.year = 2015;

                transformedOffering = OfferingRepository.transformOfferingForNewCycle(transformedOffering);
                expect(transformedOffering.history['2014'].selection).to.deep.equal(originalOffering.selection);
                expect(transformedOffering.history['2015'].selection).to.deep.equal(originalOffering.selection);
            });
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

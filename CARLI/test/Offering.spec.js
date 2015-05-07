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
    , Q = require('q')
    , _ = require('lodash')
    ;

chai.use( chaiAsPromised );

var testCycleId = uuid.v4();

function validOfferingData() {
    return {
        type: 'Offering',
        cycle: { id: testCycleId },
        library: { id: "1" },
        product: { id: uuid.v4(), vendor: 'test' },
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
    describe('Offering Repository Tests', function () {

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
                        return expect(loadedOffering.library).to.be.an('object').and.have.property('name');
                    })
                    .then(function () {
                        return expect(loadedOffering.product).to.be.an('object').and.have.property('name');
                    });
            });
        });

        it('should have a listOfferingsForLibraryId method', function () {
            expect(OfferingRepository.listOfferingsForLibraryId).to.be.a('function');
        });

        describe('listOfferingsForLibraryId View', function () {
            it('should list offerings for a specific library');
        });

        it('should have a listOfferingsForProductId method', function () {
            expect(OfferingRepository.listOfferingsForProductId).to.be.a('function');
        });

        describe('listOfferingsForProductId View', function () {
            it('should list offerings for a specific product');
        });

        it('should have a listOfferingsWithSelections method', function () {
            expect(OfferingRepository.listOfferingsWithSelections).to.be.a('function');
        });

        describe('listOfferingsWithSelections View', function () {
            it('should list offerings that have selections', function(){
                var testOfferings = [
                    validOfferingData(),
                    validOfferingData(),
                    validOfferingData()
                ];
                testOfferings[0].selection = {};

                return clearAllTestOfferings()
                    .then(setupTestOfferings)
                    .then(OfferingRepository.listOfferingsWithSelections)
                    .then(function(offerings){
                        return Q.all([
                            expect(offerings).to.be.an('array'),
                            expect(offerings.length).to.equal(1),
                            expect(offerings[0].selection).to.be.an('object')
                        ]);
                    });


                function setupTestOfferings(){
                    return Q.all( testOfferings.map(createTestOffering) )
                        .thenResolve(testCycle);

                    function createTestOffering(offering){
                        return OfferingRepository.create(offering, testCycle);
                    }
                }
            });
        });

        it('should have a listVendorsFromOfferingIds method', function () {
            expect(OfferingRepository.listVendorsFromOfferingIds).to.be.a('function');
        });

        describe('listVendorsForOfferings', function () {
            it('should take a list of offering ids and return the set of Vendor id for those offerings', function(){
                var testProducts = [
                    { id: 'tp1', type: 'Product', name: 'Test Product 1', cycle: testCycle, vendor: 'test-vendor-1' },
                    { id: 'tp2', type: 'Product', name: 'Test Product 2', cycle: testCycle, vendor: 'test-vendor-2' }
                ];

                var testOfferings = [ validOfferingData(), validOfferingData(), validOfferingData() ];
                testOfferings[0].product = testProducts[0];
                testOfferings[1].product = testProducts[0];
                testOfferings[2].product = testProducts[1];

                return setupTestData()
                    .then(function( listOfOfferingIds ){
                        return OfferingRepository.listVendorsFromOfferingIds( listOfOfferingIds, testCycle );
                    })
                    .then(function( listOfVendorIds ){
                        return Q.all([
                            expect(listOfVendorIds).to.be.an('array'),
                            expect(listOfVendorIds.length).to.equal(2),
                            expect(listOfVendorIds).to.include('test-vendor-1'),
                            expect(listOfVendorIds).to.include('test-vendor-2')
                        ]);
                    });


                function setupTestData(){
                    return setupTestProducts()
                        .then(clearAllTestOfferings)
                        .then(setupTestOfferings);

                    function setupTestProducts(){
                        return Q.all( testProducts.map(createTestProduct) );

                        function createTestProduct(product){
                            return ProductRepository.create(product, testCycle);
                        }
                    }

                    function setupTestOfferings(){
                        return Q.all( testOfferings.map(createTestOffering) );

                        function createTestOffering(offering){
                            return OfferingRepository.create(offering, testCycle);
                        }
                    }
                }
            });
        });

        describe('copyOfferingHistoryForYear', function() {
            it('should copy the pricing data to a history property and preserve past history if it exists', function() {
                var originalOffering = validOfferingData();
                originalOffering.cycle = _.clone(testCycle);
                originalOffering.cycle.year = 2014;

                var transformedOffering = OfferingRepository.copyOfferingHistoryForYear(originalOffering, 2014);
                expect(transformedOffering.history['2014'].pricing).to.deep.equal(originalOffering.pricing);

                transformedOffering.cycle = _.clone(testCycle);
                transformedOffering.cycle.year = 2015;

                transformedOffering = OfferingRepository.copyOfferingHistoryForYear(transformedOffering, 2015);
                expect(transformedOffering.history['2014'].pricing).to.deep.equal(originalOffering.pricing);
                expect(transformedOffering.history['2015'].pricing).to.deep.equal(originalOffering.pricing);

            });
            it('should copy the selection data to a history property and preserve past history if it exists', function() {
                var originalOffering = validOfferingData();
                originalOffering.cycle = _.clone(testCycle);
                originalOffering.cycle.year = 2014;
                originalOffering.selection = { foo: 'bar' };

                var transformedOffering = OfferingRepository.copyOfferingHistoryForYear(originalOffering, 2014);
                expect(transformedOffering.history['2014'].selection).to.deep.equal(originalOffering.selection);

                transformedOffering.cycle = _.clone(testCycle);
                transformedOffering.cycle.year = 2015;

                transformedOffering = OfferingRepository.copyOfferingHistoryForYear(transformedOffering, 2015);
                expect(transformedOffering.history['2014'].selection).to.deep.equal(originalOffering.selection);
                expect(transformedOffering.history['2015'].selection).to.deep.equal(originalOffering.selection);
            });
        });

        describe('Repository getFlaggedState', function () {
            it('should return true if the offering has property set to true', function() {
                var testOffering = validOfferingData();
                testOffering.flagged = true;

                expect(OfferingRepository.getFlaggedState(testOffering)).to.equal(true);
            });

            it('should return false if the offering has property set to false', function() {
                var testOffering = validOfferingData();
                testOffering.flagged = false;

                expect(OfferingRepository.getFlaggedState(testOffering)).to.equal(false);
            });

            it('should compute false if the offering has valid pricing data', function() {
                var testOffering = validOfferingData();
                expect(OfferingRepository.getFlaggedState(testOffering)).to.equal(false);
            });

            it('should compute true if the offering has an su price greater than the site license price', function() {
                var testOffering = validOfferingData();
                testOffering.pricing = {
                    site: 1000,
                    su: [{
                        users: 2,
                        price: 2000
                    }]
                };

                expect(OfferingRepository.getFlaggedState(testOffering)).to.equal(true);
            });

            it('should compute true if there is a su price higher than the price for a larger number of users', function() {
                var testOffering = validOfferingData();
                testOffering.pricing = {
                    site: 9999,
                    su: [
                        { users: 1, price: 1000 },
                        { users: 2, price: 200 },
                        { users: 3, price: 300 }
                    ]
                };

                expect(OfferingRepository.getFlaggedState(testOffering)).to.equal(true);
            });
        });

        describe('getOfferingsById', function(){
            it('should be a function', function(){
                expect(OfferingRepository.getOfferingsById).to.be.a('function');
            })
        });

        it('should have a createOfferingsFor method', function () {
            expect(OfferingRepository.createOfferingsFor).to.be.a('function');
        });

        describe('createOfferingsFor', function(){
            it('should return a list of offering id created for the specified product and libraries', function(){
                testProductId = 'test-product-id';
                testLibraryIds = [ 1, 2, 3 ];

                return OfferingRepository.createOfferingsFor( testProductId, testLibraryIds, testCycle )
                    .then(function( offeringIds ){
                        return Q.all([
                            expect(offeringIds).to.be.an('array'),
                            expect(offeringIds.length).to.equal(3),
                            verifyOfferingsHaveCorrectProperties(offeringIds)
                        ]);
                    });


                function verifyOfferingsHaveCorrectProperties(offeringIds){
                    return OfferingRepository.load(offeringIds[0], testCycle).then(function(offering){
                        return expect(offering.product).to.equal(testProductId);
                    });
                }
            })
        });

        it('should have a setSuPricingForAllLibrariesForProduct method', function(){
            expect(OfferingRepository.setSuPricingForAllLibrariesForProduct).to.be.a('function');
        });

        describe('setSuPricingForAllLibrariesForProduct', function(){
            it('should set the su pricing on all offerings for a product', function(){
                var testProductId = uuid.v4();
                var testNewSuPricing = [
                    { users: 1, price: 100 },
                    { users: 2, price: 200 },
                    { users: 3, price: 300 },
                    { users: 4, price: 400 }
                ];

                return setupTestData()
                    .then(function(){
                        return OfferingRepository.setSuPricingForAllLibrariesForProduct(testProductId, testNewSuPricing, testCycle);
                    })
                    .then(verifyAllOfferingsWereUpdated);

                function setupTestData(){
                    var testOfferings = [
                        {
                            type: 'Offering', cycle: testCycle, product: testProductId, library: '1',
                            pricing: {
                                su: [
                                    { users: 1, price: 1 },
                                    { users: 2, price: 2 }
                                ]
                            }
                        },
                        {
                            type: 'Offering', cycle: testCycle, product: testProductId, library: '2',
                            pricing: {
                                su: []
                            }
                        },
                        {
                            type: 'Offering', cycle: testCycle, product: testProductId, library: '3',
                            pricing: {}
                        }
                    ];

                    return Q.all( testOfferings.map(function(offering){
                        return OfferingRepository.create( offering, testCycle );
                    }) );
                }

                function verifyAllOfferingsWereUpdated( arrayOfOfferings ){
                    return Q.all([
                        expect( arrayOfOfferings.length).to.be.greaterThan(1),
                        expect( arrayOfOfferings ).to.satisfy( allOfferingsHaveNewSuPricing )
                    ]);

                    function allOfferingsHaveNewSuPricing( arrayOfOfferings ){
                        return arrayOfOfferings.every(function(offering){
                            return _.isArray(offering.pricing.su) && _.isEqual( offering.pricing.su, testNewSuPricing);
                        });
                    }
                }
            });

            it('does not call OfferingRepository.update on the offerings');
        });

        it('should have an updateSuPricingForAllLibrariesForProduct method', function(){
            expect(OfferingRepository.updateSuPricingForAllLibrariesForProduct).to.be.a('function');
        });

        describe('updateSuPricingForAllLibrariesForProduct', function(){
            it('calls setSuPricingForAllLibrariesForProduct and then bulk updates the offerings');
        });
    });


    function clearAllTestOfferings(){
        return OfferingRepository.list(testCycle)
            .then(function(offeringsList){
                return Q.allSettled(offeringsList.map(function(entity){
                    return OfferingRepository.delete(entity.id, testCycle);
                }));
            });
    }

}

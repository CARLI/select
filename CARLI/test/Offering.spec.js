var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var config = require('../../config');
var CycleRepository = require('../Entity/CycleRepository');
var expect = chai.expect;
var offeringRepository = require('../Entity/OfferingRepository');
var ProductRepository = require('../Entity/ProductRepository');
var Q = require('q');
var test = require('./Entity/EntityInterface.spec');
var testUtils = require('./utils');
var uuid = require('node-uuid');
var _ = require('lodash');

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

function undefinedValue(){}

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

describe('String constants in the Offering module', function(){
    it('should export a constant for Site License selections', function(){
        expect(offeringRepository.siteLicenseSelectionUsers).to.equal('Site License');
    });
});

describe('Run the cycle-dependent Offering tests', function () {
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

        it('should not fail to create an offering with an undefined library comment', function(){
            var testOffering = {
                type: 'Offering',
                cycle: 'test-cycle',
                library: 'test-library',
                product: 'test-product',
                libraryComments: undefinedValue()
            };

            return expect( offeringRepository.create(testOffering, testCycle) ).to.be.fulfilled;
        });

        describe('Expanding referenced entities on load', function () {

            var testOffering = validOfferingData();
            testOffering.id = 'my-test-id';

            var testProduct = {id: testOffering.product.id, cycle: testCycle, type: "Product", name: "offering test product name", vendor: uuid.v4() };

            it('should expand references to products and libraries in Offerings', function () {
                var loadedOffering;

                return ProductRepository.create(testProduct, testCycle)
                    .then(function() {
                        return offeringRepository.create(testOffering, testCycle);
                    })
                    .then(function( offeringId ){
                        return offeringRepository.load(offeringId, testCycle);
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
            expect(offeringRepository.listOfferingsForLibraryId).to.be.a('function');
        });

        describe('listOfferingsForLibraryId View', function () {
            it('should list offerings for a specific library');
        });

        it('should have a listOfferingsForProductId method', function () {
            expect(offeringRepository.listOfferingsForProductId).to.be.a('function');
        });

        describe('listOfferingsForProductId View', function () {
            it('should list offerings for a specific product');
        });

        it('should have a listOfferingsWithSelections method', function () {
            expect(offeringRepository.listOfferingsWithSelections).to.be.a('function');
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
                    .then(offeringRepository.listOfferingsWithSelections)
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
                        return offeringRepository.create(offering, testCycle);
                    }
                }
            });
        });

        it('should have a listVendorsFromOfferingIds method', function () {
            expect(offeringRepository.listVendorsFromOfferingIds).to.be.a('function');
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
                        return offeringRepository.listVendorsFromOfferingIds( listOfOfferingIds, testCycle );
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
                            return offeringRepository.create(offering, testCycle);
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

                var transformedOffering = offeringRepository.copyOfferingHistoryForYear(originalOffering, 2014);
                expect(transformedOffering.history['2014'].pricing).to.deep.equal(originalOffering.pricing);

                transformedOffering.cycle = _.clone(testCycle);
                transformedOffering.cycle.year = 2015;

                transformedOffering = offeringRepository.copyOfferingHistoryForYear(transformedOffering, 2015);
                expect(transformedOffering.history['2014'].pricing).to.deep.equal(originalOffering.pricing);
                expect(transformedOffering.history['2015'].pricing).to.deep.equal(originalOffering.pricing);

            });
            it('should copy the selection data to a history property and preserve past history if it exists', function() {
                var originalOffering = validOfferingData();
                originalOffering.cycle = _.clone(testCycle);
                originalOffering.cycle.year = 2014;
                originalOffering.selection = { foo: 'bar' };

                var transformedOffering = offeringRepository.copyOfferingHistoryForYear(originalOffering, 2014);
                expect(transformedOffering.history['2014'].selection).to.deep.equal(originalOffering.selection);

                transformedOffering.cycle = _.clone(testCycle);
                transformedOffering.cycle.year = 2015;

                transformedOffering = offeringRepository.copyOfferingHistoryForYear(transformedOffering, 2015);
                expect(transformedOffering.history['2014'].selection).to.deep.equal(originalOffering.selection);
                expect(transformedOffering.history['2015'].selection).to.deep.equal(originalOffering.selection);
            });
        });

        describe('getOfferingsById', function(){
            it('should be a function', function(){
                expect(offeringRepository.getOfferingsById).to.be.a('function');
            })
        });

        it('should have a createOfferingsFor method', function () {
            expect(offeringRepository.createOfferingsFor).to.be.a('function');
        });

        describe('createOfferingsFor', function(){
            it('should return a list of offering id created for the specified product and libraries', function(){
                testProductId = 'test-product-id';
                testVendorId = 'test-vendor-id';
                testLibraryIds = [ '1', '2', '3' ];

                return offeringRepository.createOfferingsFor( testProductId, testVendorId, testLibraryIds, testCycle )
                    .then(function( offeringIds ){
                        return Q.all([
                            expect(offeringIds).to.be.an('array'),
                            expect(offeringIds.length).to.equal(3),
                            verifyOfferingsHaveCorrectProperties(offeringIds)
                        ]);
                    });


                function verifyOfferingsHaveCorrectProperties(offeringIds){
                    return offeringRepository.load(offeringIds[0], testCycle).then(function(offering){
                        return expect(offering.product).to.equal(testProductId);
                    });
                }
            })
        });

        it('should have a setSuPricingForAllLibrariesForProduct method', function(){
            expect(offeringRepository.setSuPricingForAllLibrariesForProduct).to.be.a('function');
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
                        return offeringRepository.setSuPricingForAllLibrariesForProduct(testProductId, testNewSuPricing, {}, testCycle);
                    })
                    .then(verifyAllOfferingsGotNewPricing);

                function setupTestData(){
                    var testOfferings = [
                        {
                            type: 'Offering', cycle: testCycle, product: testProductId, library: '1', vendorId: 'test',
                            pricing: {
                                su: [
                                    { users: 1, price: 1 },
                                    { users: 2, price: 2 }
                                ]
                            }
                        },
                        {
                            type: 'Offering', cycle: testCycle, product: testProductId, library: '2', vendorId: 'test',
                            pricing: {
                                su: []
                            }
                        },
                        {
                            type: 'Offering', cycle: testCycle, product: testProductId, library: '3', vendorId: 'test',
                            pricing: {}
                        }
                    ];

                    return Q.all( testOfferings.map(function(offering){
                        return offeringRepository.create( offering, testCycle );
                    }) );
                }

                function verifyAllOfferingsGotNewPricing( arrayOfOfferings ){
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

            it('does not call offeringRepository.update on the offerings');
        });

        it('should have an updateSuPricingForAllLibrariesForProduct method', function(){
            expect(offeringRepository.updateSuPricingForAllLibrariesForProduct).to.be.a('function');
        });

        describe('updateSuPricingForAllLibrariesForProduct', function(){
            it('calls setSuPricingForAllLibrariesForProduct and then bulk updates the offerings');
        });

        it('should have an ensureProductHasOfferingsForAllLibraries', function(){
            expect(offeringRepository.ensureProductHasOfferingsForAllLibraries).to.be.a('function');
        });

        describe('ensureProductHasOfferingsForAllLibraries', function(){
            it('lists libraries that do not already have offerings for a product and calls createOfferingsFor');
        });

        it('should have an getFullSelectionPrice function', function(){
            expect(offeringRepository.getFullSelectionPrice).to.be.a('function');
        });

        describe('getFullSelectionPrice',function() {
            it ('should return null if no selection', function() {
                var unselectedOffering = {};
                var price = offeringRepository.getFullSelectionPrice(unselectedOffering);
                return expect(price).to.equal(0);
            });
            it ('should return the price from the pricing object for the selected users', function() {
                var selectedSuOffering = {
                    pricing: {
                        su: [ { users: 5, price: 1000 } ]
                    },
                    selection: { users: 5 }
                };
                var price = offeringRepository.getFullSelectionPrice(selectedSuOffering);
                return expect(price).to.equal(1000);
            });
            it ('should return the price from the pricing object for the selected site license', function() {
                var selectedSiteOffering = {
                    pricing: { site: 5000 },
                    selection: { users: offeringRepository.siteLicenseSelectionUsers }
                };
                var price = offeringRepository.getFullSelectionPrice(selectedSiteOffering);
                return expect(price).to.equal(5000);
            });
            it ('should not break on bogus data', function() {
                var bogusOffering = {
                    pricing: { su: [] },
                    selection: { users: 1 }
                };
                var price = offeringRepository.getFullSelectionPrice(bogusOffering);
                return expect(price).to.equal(0);
            });
        });

        it('should have an getFundedSelectionPrice function', function(){
            expect(offeringRepository.getFundedSelectionPrice).to.be.a('function');
        });

        describe('getFundedSelectionPrice',function() {
            it ('should return the discounted price by percent', function() {
                var fundedPrice = offeringRepository.getFundedSelectionPrice({
                    pricing: { site: 100 },
                    selection: { users: offeringRepository.siteLicenseSelectionUsers },
                    funding: { fundedByPercentage: true, fundedPercent: 25 }
                });
                return expect(fundedPrice).to.equal(75);
            });
            it ('should return the discounted price by fixed amount', function() {
                var fundedPrice = offeringRepository.getFundedSelectionPrice({
                    pricing: { site: 100 },
                    selection: { users: offeringRepository.siteLicenseSelectionUsers },
                    funding: { fundedByPercentage: false, fundedPrice: 83 }
                });
                return expect(fundedPrice).to.equal(83);
            });
            it ('should treat zero percent funding as full price', function() {
                var fundedPrice = offeringRepository.getFundedSelectionPrice({
                    pricing: { site: 100 },
                    selection: { users: offeringRepository.siteLicenseSelectionUsers },
                    funding: { fundedByPercentage: true, fundedPercent: 0 }
                });
                return expect(fundedPrice).to.equal(100);
            });
            it ('should treat a zero fixed price as not funded', function() {
                var fundedPrice = offeringRepository.getFundedSelectionPrice({
                    pricing: { site: 100 },
                    selection: { users: offeringRepository.siteLicenseSelectionUsers },
                    funding: { fundedByPercentage: false, fundedPrice: 0 }
                });
                return expect(fundedPrice).to.equal(100);
            });
        });
    });

    it('should have an getFundedSiteLicensePrice function', function(){
        expect(offeringRepository.getFundedSiteLicensePrice).to.be.a('function');
    });

    describe('getFundedSiteLicensePrice',function() {
        it ('should return the discounted price by percent', function() {
            var fundedPrice = offeringRepository.getFundedSiteLicensePrice({
                pricing: { site: 100 },
                funding: { fundedByPercentage: true, fundedPercent: 25 }
            });
            return expect(fundedPrice).to.equal(75);
        });
        it ('should return the discounted price by fixed amount', function() {
            var fundedPrice = offeringRepository.getFundedSiteLicensePrice({
                pricing: { site: 100 },
                funding: { fundedByPercentage: false, fundedPrice: 83 }
            });
            return expect(fundedPrice).to.equal(83);
        });
        it ('should treat zero percent funding as full price', function() {
            var fundedPrice = offeringRepository.getFundedSiteLicensePrice({
                pricing: { site: 100 },
                funding: { fundedByPercentage: true, fundedPercent: 0 }
            });
            return expect(fundedPrice).to.equal(100);
        });
        it ('should treat a zero fixed price as not funded', function() {
            var fundedPrice = offeringRepository.getFundedSiteLicensePrice({
                pricing: { site: 100 },
                funding: { fundedByPercentage: false, fundedPrice: 0 }
            });
            return expect(fundedPrice).to.equal(100);
        });
    });

    it('should have an getFundedSelectionPendingPrice function', function(){
        expect(offeringRepository.getFundedSelectionPendingPrice).to.be.a('function');
    });

    describe('getFundedSelectionPendingPrice',function() {
        it ('should return the discounted price by percent', function() {
            var fundedPrice = offeringRepository.getFundedSelectionPendingPrice({
                selectionPendingReview: { price: 100 },
                funding: { fundedByPercentage: true, fundedPercent: 25 }
            });
            return expect(fundedPrice).to.equal(75);
        });
        it ('should return the discounted price by fixed amount', function() {
            var fundedPrice = offeringRepository.getFundedSelectionPendingPrice({
                selectionPendingReview: { price: 100 },
                funding: { fundedByPercentage: false, fundedPrice: 83 }
            });
            return expect(fundedPrice).to.equal(83);
        });
        it ('should treat zero percent funding as full price', function() {
            var fundedPrice = offeringRepository.getFundedSelectionPendingPrice({
                selectionPendingReview: { price: 100 },
                funding: { fundedByPercentage: true, fundedPercent: 0 }
            });
            return expect(fundedPrice).to.equal(100);
        });
        it ('should treat a zero fixed price as not funded', function() {
            var fundedPrice = offeringRepository.getFundedSelectionPendingPrice({
                selectionPendingReview: { price: 100 },
                funding: { fundedByPercentage: false, fundedPrice: 0 }
            });
            return expect(fundedPrice).to.equal(100);
        });
    });

    describe('removeSitePricing', function() {
        it('should gracefully handle an empty object', function () {
            var fn = function() {
                offeringRepository.removeSitePricing({});
            };
            expect(fn).to.not.throw();
        });

        it('should gracefully handle no argument', function () {
            var fn = function() {
                offeringRepository.removeSitePricing();
            };
            expect(fn).to.not.throw();
        });
    });

    describe('filtering out non-invoiced products', function () {
        it('should should return a new array of offerings, with products marked "do not invoice" removed', function () {
            var exampleOfferings = [
                {
                    id: 'id1',
                    type: 'Offering',
                    product: {
                        name: 'test product 1'
                    }
                },
                {
                    id: 'id2',
                    type: 'Offering',
                    product: {
                        name: 'test product 1'
                    }
                },
                {
                    id: 'id3',
                    type: 'Offering',
                    product: {
                        name: 'test product 1',
                        doNotInvoice: true
                    }
                }
            ];

            var expectedOutput = [
                {
                    id: 'id1',
                    type: 'Offering',
                    product: {
                        name: 'test product 1'
                    }
                },
                {
                    id: 'id2',
                    type: 'Offering',
                    product: {
                        name: 'test product 1'
                    }
                }
            ];

            var actualOutput = offeringRepository.filterOutExternallyInvoicedProducts(exampleOfferings);

            expect(actualOutput).to.deep.equal(expectedOutput);
        });
    });

    describe('the updateHistory repository method', function() {
        var expectedOffering = {
            id: 'uuid',
            type: 'Offering',
            funding: 'test-value',
            pricing: {
                site: 800,
                su: []
            },
            history: {
                "1980": {
                    funding: 'test-value',
                    pricing: {
                        site: 800,
                        su: []
                    },
                    selection: {
                        users: "Site License",
                        price: 800
                    }
                }
            }
        };

        it('should update the history on the new offering based on the selection of the old (last year) offering', function() {
            var oldOfferingFromCycle1980 = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                selection: {
                    users: "Site License",
                    price: 800
                }
            };

            var newOfferingMissingSelectionHistory = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                history: {
                    "1980": {
                        funding: 'test-value',
                        pricing: {
                            site: 800,
                            su: []
                        }
                    }
                }
            };

            var actualOffering = offeringRepository.updateHistory(oldOfferingFromCycle1980, newOfferingMissingSelectionHistory, 1980);

            expect(actualOffering).to.deep.equal(expectedOffering);
        });

        it('does not fail if there is no history, should create the history property', function() {
            var oldOfferingFromCycle1980 = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                selection: {
                    users: "Site License",
                    price: 800
                }
            };

            var newOfferingMissingHistory = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                }
            };

            var actualOffering = offeringRepository.updateHistory(oldOfferingFromCycle1980, newOfferingMissingHistory, 1980);

            expect(actualOffering).to.deep.equal(expectedOffering);
        });

        it('does not fail if there is no history for the specified year, should create the history property', function() {
            var oldOfferingFromCycle1980 = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                selection: {
                    users: "Site License",
                    price: 800
                }
            };

            var newOfferingMissingHistoryFor1980 = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                history: {}
            };

            var actualOffering = offeringRepository.updateHistory(oldOfferingFromCycle1980, newOfferingMissingHistoryFor1980, 1980);

            expect(actualOffering).to.deep.equal(expectedOffering);
        });

        it('does not save a direct reference to the old offering', function() {
            var oldOfferingFromCycle1980 = {
                id: 'uuid',
                type: 'Offering',
                funding: {
                    'test': 'value'
                },
                pricing: {
                    site: 800,
                    su: []
                },
                selection: {
                    users: "Site License",
                    price: 800
                }
            };

            var newOfferingMissingSelectionHistory = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                history: {
                    "1980": {
                        funding: 'test-value',
                        pricing: {
                            site: 800,
                            su: []
                        }
                    }
                }
            };

            var actualOffering = offeringRepository.updateHistory(oldOfferingFromCycle1980, newOfferingMissingSelectionHistory, 1980);

            expect(actualOffering.history['1980'].funding).to.not.equal(oldOfferingFromCycle1980.funding);
            expect(actualOffering.history['1980'].pricing).to.not.equal(oldOfferingFromCycle1980.pricing);
            expect(actualOffering.history['1980'].selection).to.not.equal(oldOfferingFromCycle1980.selection);
        });

        it('does not add a selection to the history if the historical offering did not have one', function() {
            var oldOfferingFromCycle1980WithNoSelection = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                }
            };

            var newOfferingMissingSelectionHistory = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                history: {}
            };

            var expectedOffering = {
                id: 'uuid',
                type: 'Offering',
                funding: 'test-value',
                pricing: {
                    site: 800,
                    su: []
                },
                history: {
                    "1980": {
                        funding: 'test-value',
                        pricing: {
                            site: 800,
                            su: []
                        }
                    }
                }
            };

            var actualOffering = offeringRepository.updateHistory(oldOfferingFromCycle1980WithNoSelection, newOfferingMissingSelectionHistory, 1980);

            expect(actualOffering).to.deep.equal(expectedOffering);
        });
    });

    function clearAllTestOfferings(){
        return offeringRepository.list(testCycle)
            .then(function(offeringsList){
                return Q.allSettled(offeringsList.map(function(entity){
                    return offeringRepository.delete(entity.id, testCycle);
                }));
            });
    }

}

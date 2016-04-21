var chai = require('chai');
var expect = chai.expect;
var offeringRepository = require('../Entity/OfferingRepository');
var uuid = require('node-uuid');

function validOfferingData() {
    return {
        type: 'Offering',
        cycle: {id: 'offering-test-cycle'},
        library: {id: "1"},
        product: {id: uuid.v4(), vendor: 'test'},
        pricing: {
            site: 1200,
            su: [{
                users: 2,
                price: 700
            }]
        }
    };
}
describe('Repository getFlaggedState', function () {
    it('should return true if the offering has property set to true', function () {
        var testOffering = validOfferingData();
        testOffering.flagged = true;

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should return false if the offering has property set to false', function () {
        var testOffering = validOfferingData();
        testOffering.flagged = false;

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(false);
    });

    it('should compute false if the offering has valid pricing data', function () {
        var testOffering = validOfferingData();
        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(false);
    });

    it('should compute false if the offering has not been updated', function () {
        var testOffering = validOfferingData();
        testOffering.pricing = {
            site: 1000,
            su: [
                {users: 2, price: 2000},
                {users: 3, price: 300}
            ]
        };
        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(false);
    });

    it('should compute true if the offering has an su price greater than the site license price', function () {
        var testOffering = validOfferingData();
        testOffering.suPricesUpdated = '2015-01-01';
        testOffering.pricing = {
            site: 1000,
            su: [{
                users: 2,
                price: 2000
            }]
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute true if the offering has an su price greater than a site license price of zero', function () {
        var testOffering = validOfferingData();
        testOffering.suPricesUpdated = '2015-01-01';
        testOffering.pricing = {
            site: 0,
            su: [{
                users: 2,
                price: 2000
            }]
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute false if the offering has su pricing but no site license price', function () {
        var testOffering = validOfferingData();
        testOffering.suPricesUpdated = '2015-01-01';
        testOffering.pricing = {
            su: [{
                users: 2,
                price: 2000
            }]
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(false);
    });

    it('should compute true if there is a su price higher than the price for a larger number of users', function () {
        var testOffering = validOfferingData();
        testOffering.suPricesUpdated = '2015-01-01';
        testOffering.pricing = {
            site: 9999,
            su: [
                {users: 1, price: 1000},
                {users: 2, price: 200},
                {users: 3, price: 300}
            ]
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute true if there is a su price equal to the price for a larger number of users', function () {
        var testOffering = validOfferingData();
        testOffering.suPricesUpdated = '2015-01-01';
        testOffering.pricing = {
            site: 9999,
            su: [
                {users: 1, price: 1000},
                {users: 2, price: 2000},
                {users: 3, price: 2000}
            ]
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute true if increase from any of last years SU prices exceed the price cap', function () {
        var testOffering = validOfferingData();
        testOffering.suPricesUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'price-cap-su-increase-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            site: 500,
            su: [
                {users: 1, price: 200},
                {users: 2, price: 300},
                {users: 3, price: 400}
            ]
        };
        testOffering.history = {
            2013: {
                pricing: {
                    site: 500,
                    su: [
                        {users: 1, price: 100},
                        {users: 2, price: 200},
                        {users: 3, price: 300}
                    ]
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute true if increase of the site license price exceeds the price cap', function () {
        var testOffering = validOfferingData();
        testOffering.siteLicensePriceUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'price-cap-site-license-increase-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            site: 500
        };
        testOffering.history = {
            2013: {
                pricing: {
                    site: 100
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute true if decrease from last years Site License price exceeds 5%', function () {
        var testOffering = validOfferingData();
        testOffering.siteLicensePriceUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'price-decrease-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            site: 500
        };
        testOffering.history = {
            2013: {
                pricing: {
                    site: 1000
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute true if any decrease from last years SU price exceeds 5%', function () {
        var testOffering = validOfferingData();
        testOffering.siteLicensePriceUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'price-decrease-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            su: [
                {users: 1, price: 100},
                {users: 2, price: 200},
                {users: 3, price: 300}
            ]
        };
        testOffering.history = {
            2013: {
                pricing: {
                    su: [
                        {users: 1, price: 2000},
                        {users: 2, price: 3000},
                        {users: 3, price: 4000}
                    ]
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(true);
    });

    it('should compute false if increase or decrease is within acceptable range', function () {
        var testOffering = validOfferingData();
        testOffering.siteLicensePriceUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'price-change-okay-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            site: 480,
            su: [
                {users: 1, price: 96},
                {users: 2, price: 218},
                {users: 3, price: 327}
            ]
        };
        testOffering.history = {
            2013: {
                pricing: {
                    site: 500,
                    su: [
                        {users: 1, price: 100},
                        {users: 2, price: 200},
                        {users: 3, price: 300}
                    ]
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.equal(false);
    });

    it('should not break if the offering is missing su pricing history', function () {
        var testOffering = validOfferingData();
        testOffering.siteLicensePriceUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'no-history-su-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            site: 480,
            su: [
                {users: 1, price: 96},
                {users: 2, price: 218},
                {users: 3, price: 327}
            ]
        };
        testOffering.history = {
            2013: {
                pricing: {
                    site: 100
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.be.ok;
    });

    it('should not break if the offering is missing site license pricing history', function () {
        var testOffering = validOfferingData();
        testOffering.siteLicensePriceUpdated = '2015-01-01';
        testOffering.cycle = {
            id: 'no-history-su-test-cycle',
            year: 2014
        };
        testOffering.product.priceCap = 10;
        testOffering.pricing = {
            site: 480,
            su: [
                {users: 1, price: 900}
            ]
        };
        testOffering.history = {
            2013: {
                pricing: {
                    su: [
                        {users: 1, price: 9}
                    ]
                }
            }
        };

        expect(offeringRepository.getFlaggedState(testOffering)).to.be.ok;
    });

    describe(' side effect: offering.flaggedReason - an array describing why the offering was flagged', function () {
        it('should contain "flagged by staff" if it was manually set', function () {
            var testOffering = validOfferingData();
            testOffering.flagged = true;
            offeringRepository.getFlaggedState(testOffering);

            expect(testOffering.flaggedReason).to.deep.equal(['flagged by CARLI staff']);
        });

        it('should be empty if the offering was manually un-flagged', function () {
            var testOffering = validOfferingData();
            testOffering.flagged = false;
            offeringRepository.getFlaggedState(testOffering);

            expect(testOffering.flaggedReason).to.be.an('undefined');
        });

        it('should be empty if the offering has valid pricing data', function () {
            var testOffering = validOfferingData();
            offeringRepository.getFlaggedState(testOffering);

            expect(testOffering.flaggedReason).to.be.an('undefined');
        });

        it('should contain "a site license price for less than a SU price" if the offering has an su price greater than the site license price', function () {
            var testOffering = validOfferingData();
            testOffering.suPricesUpdated = '2015-01-01';
            testOffering.pricing = {
                site: 1000,
                su: [{
                    users: 2,
                    price: 2000
                }]
            };
            offeringRepository.getFlaggedState(testOffering);
            expect(testOffering.flaggedReason).to.deep.equal(['The site license price must be greater than any SU price']);
        });

        it('should be empty if the offering had invalid pricing which was then fixed', function () {
            var testOffering = validOfferingData();
            testOffering.suPricesUpdated = '2015-01-01';
            testOffering.pricing = {
                site: 1000,
                su: [{
                    users: 2,
                    price: 2000
                }]
            };
            offeringRepository.getFlaggedState(testOffering);

            testOffering.pricing.site = 9999;
            offeringRepository.getFlaggedState(testOffering);

            expect(testOffering.flaggedReason).to.be.an('undefined');
        });
    });
});
var expect = require('chai').expect;
var vendorSiteLicensePriceModule = require('../VendorSiteLicensePrice.js');

describe('The VendorSiteLicensePrice Module', function () {
    it('should have a validate method', function () {
        expect(vendorSiteLicensePriceModule.validate).to.be.a('function');
    });

    it('returns false for invalid objects', function () {
        var invalidObjectEmpty = {};
        var invalidObjectNoLibrary = {
            product: 'product-id',
            price: 1200
        };
        var invalidObjectNoProduct = {
            library: 1,
            price: 800
        };
        var invalidObjectNoPrice = {
            product: 'product-id',
            library: 7
        };

        expect(vendorSiteLicensePriceModule.validate(invalidObjectEmpty)).to.equal(false);
        expect(vendorSiteLicensePriceModule.validate(invalidObjectNoLibrary)).to.equal(false);
        expect(vendorSiteLicensePriceModule.validate(invalidObjectNoProduct)).to.equal(false);
        expect(vendorSiteLicensePriceModule.validate(invalidObjectNoPrice)).to.equal(false);
    });

    it('returns true for valid objects', function () {
        var validObject = {
            product: 'product-id',
            library: 1,
            price: '400.99'
        };

        expect(vendorSiteLicensePriceModule.validate(validObject)).to.equal(true);
    });

    it('should have a validateList method to validate arrays of pricing objects', function () {
        expect(vendorSiteLicensePriceModule.validateList).to.be.a('function');
    });

    it('should return an object with counts of how many were valid or not', function () {
        var list = [
            {
                product: 'valid-product-id',
                library: 1,
                price: '400.99'
            },
            {
                product: 'valid-product-id2',
                library: 2,
                price: '300.99'
            },
            {
                product: 'invalid-no-library',
                price: 1200
            }
        ];

        var expectedResults = {
            valid: 2,
            invalid: 1
        };

        expect(vendorSiteLicensePriceModule.validateList(list)).to.deep.equal(expectedResults);
    });

    it('should have a groupByProduct method', function () {
        expect(vendorSiteLicensePriceModule.groupByProduct).to.be.a('function');
    });

    it('should return an object with keys that are product ids, with the pricing objects in arrays', function () {
        var list = [
            {
                product: 'valid-product-id',
                library: 1,
                price: '400.99'
            },
            {
                product: 'valid-product-id',
                library: 2,
                price: '300.99'
            },
            {
                product: 'valid-product-id',
                library: 3,
                price: '200.99'
            },
            {
                product: 'second-product-id',
                library: 1,
                price: '100.00'
            },
            {
                product: 'second-product-id',
                library: 2,
                price: '200.00'
            }
        ];

        const expectedResult = {
            'valid-product-id': [
                {
                    product: 'valid-product-id',
                    library: 1,
                    price: '400.99'
                },
                {
                    product: 'valid-product-id',
                    library: 2,
                    price: '300.99'
                },
                {
                    product: 'valid-product-id',
                    library: 3,
                    price: '200.99'
                }
            ],
            'second-product-id': [
                {
                    product: 'second-product-id',
                    library: 1,
                    price: '100.00'
                },
                {
                    product: 'second-product-id',
                    library: 2,
                    price: '200.00'
                }
            ]
        };

        expect(vendorSiteLicensePriceModule.groupByProduct(list)).to.deep.equal(expectedResult);
    });

    it('should have a groupByLibrary method', function () {
        expect(vendorSiteLicensePriceModule.groupByLibrary).to.be.a('function');
    });

    it('should return an object with keys that are library ids, with the pricing objects in arrays', function () {
        var list = [
            {
                product: 'valid-product-id',
                library: 1,
                price: '400.99'
            },
            {
                product: 'valid-product-id',
                library: 2,
                price: '300.99'
            },
            {
                product: 'valid-product-id',
                library: 3,
                price: '200.99'
            },
            {
                product: 'second-product-id',
                library: 1,
                price: '100.00'
            },
            {
                product: 'second-product-id',
                library: 2,
                price: '200.00'
            }
        ];

        const expectedResult = {
            '1': [
                {
                    product: 'valid-product-id',
                    library: 1,
                    price: '400.99'
                },
                {
                    product: 'second-product-id',
                    library: 1,
                    price: '100.00'
                }
            ],
            '2': [

                {
                    product: 'valid-product-id',
                    library: 2,
                    price: '300.99'
                },
                {
                    product: 'second-product-id',
                    library: 2,
                    price: '200.00'
                }
            ],
            '3': [
                {
                    product: 'valid-product-id',
                    library: 3,
                    price: '200.99'
                }
            ]
        };

        expect(vendorSiteLicensePriceModule.groupByLibrary(list)).to.deep.equal(expectedResult);
    });
});
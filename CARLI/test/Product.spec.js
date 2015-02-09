var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , ProductRepository = require('../Entity/ProductRepository' )
    , VendorRepository = require('../Entity/VendorRepository' )
    , LicenseRepository = require('../Entity/LicenseRepository' )
    , testUtils = require('./utils')
    ;

chai.use( chaiAsPromised );

var yesterday = moment().subtract(1, 'week');
var tomorrow = moment().add(1, 'week');
var testCycleId = uuid.v4();

function validProductData() {
    return {
        type: 'Product',
        name: 'Valid Product',
        isActive: true,
        vendor: 'fake-vendor-id',
        cycle: testCycleId
    };
}
function invalidProductData() {
    return {
        type: 'Product'
    };
}
function testCycleData() {
    return {
        id: testCycleId,
        idalId: 200,
        name: testUtils.testDbMarker + ' Product Tests 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    };
}

function availableOneTimePurchaseProduct() {
    var product = validProductData();
    product.id = uuid.v4();
    product.cycle = config.oneTimePurchaseProductsCycleDocId;
    product.oneTimePurchase = { availableForPurchaseThrough: tomorrow.toISOString() };
    return product;
}
function unavailableOneTimePurchaseProduct() {
    var product = validProductData();
    product.id = uuid.v4();
    product.cycle = config.oneTimePurchaseProductsCycleDocId;
    product.oneTimePurchase = { availableForPurchaseThrough: yesterday.toISOString() };
    return product;
}

describe('Run the product tests', function () {
    it ('runs product tests', function (done) {
        return CycleRepository.create(testCycleData())
            .then(CycleRepository.load)
            .then(function (testCycle) {
                test.run('Product', validProductData, invalidProductData, testCycle);
                runProductSpecificTests(testCycle);
                done();
            });
    });
    it ('also runs one time purchase product tests', function (done) {
         return CycleRepository.load(config.oneTimePurchaseProductsCycleDocId)
            .then(function (testCycle) {
                runOneTimePurchaseProductTests(testCycle);
                done();
            });
    });
});


function runProductSpecificTests(testCycle) {
    describe('Converting referenced entities', function () {

        //The Repository should store references to sub-Entities as their ID, not the whole object
        describe('Stripping referenced entities on create/update', function () {
            //we can't test this without looking at the Store directly
            it('should convert objects to id');
        });

        describe('Expanding referenced entities on load', function () {

            var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name"};
            var license = {id: uuid.v4(), type: "License", name: "my license name", vendor: 'Some Bogus Vendor'};

            it('should expand references to vendors and licenses in Products', function () {
                var product = validProductData();
                product.vendor = vendor;
                product.license = license;

                var testProduct;

                return VendorRepository.create(vendor)
                    .then(function () {
                        return LicenseRepository.create(license);
                    })
                    .then(function () {
                        return ProductRepository.create(product, testCycle);
                    })
                    .then(function (productId) {
                        return ProductRepository.load(productId, testCycle);
                    })
                    .then(function (loadedProduct) {
                        testProduct = loadedProduct;
                        return expect(testProduct.vendor).to.be.an('object').and.have.property('name');
                    })
                    .then(function () {
                        return expect(testProduct.license).to.be.an('object').and.have.property('name');
                    });
            });

            it('should expand reference to vendor even if there is no license in the product', function () {
                var product = validProductData();
                product.vendor = vendor.id;

                return ProductRepository.create(product, testCycle)
                    .then(function (productId) {
                        return ProductRepository.load(productId, testCycle);
                    })
                    .then(function (loadedProduct) {
                        return expect(loadedProduct.vendor).to.be.an('object').and.have.property('name');
                    });
            });
        });
    });

    describe('ListProductsForLicenseId View', function () {
        it('should have a listProductsForLicenseId method', function () {
            expect(ProductRepository.listProductsForLicenseId).to.be.a('function');
        });

        var license1 = {id: uuid.v4(), type: "License", name: "my license 1 name", isActive: true};
        var license2 = {id: uuid.v4(), type: "License", name: "my license 2 name", isActive: true};
        var product1 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 1 name",
            isActive: true,
            license: license1.id,
            vendor: "bogus",
            cycle: testCycleId
        };
        var product2 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 2 name",
            isActive: true,
            license: license1.id,
            vendor: "bogus",
            cycle: testCycleId
        };
        var product3 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 3 name",
            isActive: true,
            license: license2.id,
            vendor: "bogus",
            cycle: testCycleId
        };
        var product4 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 4 name",
            isActive: true,
            vendor: "bogus",
            cycle: testCycleId
        };

        it('should return products associated with a license', function () {
            return ProductRepository.create(product1, testCycle)
                .then(function () {
                    return ProductRepository.create(product2, testCycle);
                })
                .then(function () {
                return ProductRepository.create(product3, testCycle);
            })
                .then(function () {
                return ProductRepository.create(product4, testCycle);
            })
                .then(function () {
                    return ProductRepository.listProductsForLicenseId(license1.id, testCycle);
                })
                .then(function (productList) {

                    function verifyAllProductsHaveLicense(productList) {
                        var match = true;
                        var licenseToMatch = license1;

                        productList.forEach(function (product) {
                            if (product.license !== licenseToMatch.id) {
                                match = true;
                            }
                        });

                        return match;
                    }

                    return expect(productList).to.be.an('array').and.have.length(2).and.satisfy(verifyAllProductsHaveLicense);
                });
        });
    });


    describe('listProductsForVendorId View', function () {
        it('should have a listProductsForVendorId method', function () {
            expect(ProductRepository.listProductsForVendorId).to.be.a('function');
        });

        var vendor1 = {id: uuid.v4(), type: "Vendor", name: "my vendor 1 name", isActive: true};
        var vendor2 = {id: uuid.v4(), type: "Vendor", name: "my vendor 2 name", isActive: true};
        var product1 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 1 name",
            isActive: true,
            license: "bogus",
            vendor: vendor1.id,
            cycle: testCycleId
        };
        var product2 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 2 name",
            isActive: true,
            license: "bogus",
            vendor: vendor1.id,
            cycle: testCycleId
        };
        var product3 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 3 name",
            isActive: true,
            license: "bogus",
            vendor: vendor2.id,
            cycle: testCycleId
        };
        var product4 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 4 name",
            isActive: true,
            license: "bogus",
            vendor: "bogus",
            cycle: testCycleId
        };

        it('should return products associated with a vendor', function () {
            return ProductRepository.create(product1, testCycle)
                .then(function () {
                    return ProductRepository.create(product2, testCycle);
                })
                .then(function () {
                return ProductRepository.create(product3, testCycle);
            })
                .then(function () {
                return ProductRepository.create(product4, testCycle);
            })
                .then(function () {
                    return ProductRepository.listProductsForVendorId(vendor1.id, testCycle);
                })
                .then(function (productList) {

                    function verifyAllProductsHaveVendor(productList) {
                        var match = true;
                        var vendorToMatch = vendor1;

                        productList.forEach(function (product) {
                            if (product.vendor !== vendorToMatch.id) {
                                match = true;
                            }
                        });

                        return match;
                    }

                    return expect(productList).to.be.an('array').and.have.length(2).and.satisfy(verifyAllProductsHaveVendor);
                });
        });
    });

    describe('listProductCountsByVendorId View', function () {
        var vendor1 = {id: uuid.v4(), type: "Vendor", name: "test product counts vendor", isActive: true};
        var product1 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 1 name",
            isActive: true,
            license: "bogus",
            vendor: vendor1.id,
            cycle: testCycleId
        };
        var product2 = {
            id: uuid.v4(),
            type: "Product",
            name: "my product 2 name",
            isActive: true,
            license: "bogus",
            vendor: vendor1.id,
            cycle: testCycleId
        };
        it('should have a listProductCountsByVendorId method', function () {
            expect(ProductRepository.listProductCountsByVendorId).to.be.a('function');
        });
        it('should return products associated with a vendor', function () {
            return ProductRepository.create(product1, testCycle)
                .then(function () {
                    return ProductRepository.create(product2, testCycle);
                })
                .then(function () {
                    return ProductRepository.listProductCountsByVendorId(testCycle);
                })
                .then(function (countsByVendorId) {
                    return expect(countsByVendorId).to.have.property(vendor1.id, 2);
                });
        });

    });

        describe('Adding functions to Product instances', function () {
        it('should add a getIsActive method to instances of Product', function () {
            var product = validProductData();

            return ProductRepository.create(product, testCycle)
                .then(function (productId) {
                    return ProductRepository.load(productId, testCycle);
                })
                .then(function (loadedProduct) {
                    return expect(loadedProduct.getIsActive).to.be.a('function');
                });
        });

        describe('the Product.getIsActive method', function () {
            it('should return true for an active Product with an active Vendor', function () {
                var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: true};
                var product = {id: uuid.v4(), type: "Product", name: "my product name", isActive: true, cycle: testCycleId };

                return VendorRepository.create(vendor)
                    .then(function () {
                        product.vendor = vendor;
                        return ProductRepository.create(product, testCycle);
                    })
                    .then(function () {
                    return ProductRepository.load(product.id, testCycle);
                })
                    .then(function (loadedProduct) {
                    return expect(loadedProduct.getIsActive()).to.equal(true);
                });
            });

            it('should return false for an active Product with an inactive Vendor', function () {

                var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: false};
                var product = {id: uuid.v4(), type: "Product", name: "my product name", isActive: true, cycle: testCycleId};

                return VendorRepository.create(vendor)
                    .then(function () {
                        product.vendor = vendor;
                        return ProductRepository.create(product, testCycle);
                    })
                    .then(function () {
                    return ProductRepository.load(product.id, testCycle);
                })
                    .then(function (loadedProduct) {
                    return expect(loadedProduct.getIsActive()).to.equal(false);
                });
            });

            it('should return false for an inactive Product with an inactive Vendor', function () {

                var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: false};
                var product = {id: uuid.v4(), type: "Product", name: "my product name", isActive: false, cycle: testCycleId};

                return VendorRepository.create(vendor)
                    .then(function () {
                        product.vendor = vendor;
                        return ProductRepository.create(product, testCycle);
                    })
                    .then(function () {
                    return ProductRepository.load(product.id, testCycle);
                })
                    .then(function (loadedProduct) {
                    return expect(loadedProduct.getIsActive()).to.equal(false);
                });
            });

            it('should return false for an inactive Product with an active Vendor', function () {
                var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: true};
                var product = {id: uuid.v4(), type: "Product", name: "my product name", isActive: false, cycle: testCycleId};

                return VendorRepository.create(vendor)
                    .then(function () {
                        product.vendor = vendor;
                        return ProductRepository.create(product, testCycle);
                    })
                    .then(function () {
                    return ProductRepository.load(product.id, testCycle);
                })
                    .then(function (loadedProduct) {
                    return expect(loadedProduct.getIsActive()).to.equal(false);
                });
            });

            //The Repository call will fail when trying to load a Product with no Vendor, but the Vendor should fail
            it('should return false for an inactive Product with an empty Vendor');
            it('should return true for an active Product with an empty Vendor');
        });
    });

    describe('Helper functions for getting Enum values from the Product Schema', function () {

        it('should have a getProductDetailCodeOptions function', function () {
            expect(ProductRepository.getProductDetailCodeOptions).to.be.a('function');
        });

        describe('the getProductDetailCodeOptions function', function () {
            it('should return expected values', function () {
                var testData = [
                    "USIA - Membership",
                    "USIB - Database",
                    "USIE - Misc.",
                    "USIF - I-Share",
                    "USIG - Chronicle of Higher Education",
                    "USIH - OED",
                    "USII - Spring Database",
                    "USIJ - Fall Database",
                    "USIK - SFX",
                    "USIL - SFX",
                    "USIM - I-Share Pre-Pay",
                    "USIN - Database Pre-Pay"
                ];

                expect(ProductRepository.getProductDetailCodeOptions()).to.have.members(testData);
            });
        });
    });
}

function runOneTimePurchaseProductTests(testCycle) {
    describe('ProductRepository.listOneTimePurchaseProducts()', function (done) {
        it('should list a product that is available through tomorrow', function () {
            var availableProduct = availableOneTimePurchaseProduct();

            return ProductRepository.create(availableProduct, testCycle)
                .then(function () {
                    return ProductRepository.listAvailableOneTimePurchaseProducts(testCycle)
                })
                .then(function (oneTimePurchaseProductList) {

                    function findMatchingOneTimePurchase(productList) {
                        var result = false;
                        var productToMatch = availableProduct;

                        productList.forEach(function (product) {
                            if (product.id === productToMatch.id) {
                                result = true;
                            }
                        });

                        return result;
                    }

                    return expect(oneTimePurchaseProductList).to.satisfy(findMatchingOneTimePurchase);
                });
        });

        it('should not list a product that was available through yesterday', function () {
            var unavailableProduct = unavailableOneTimePurchaseProduct();

            return ProductRepository.create(unavailableProduct, testCycle)
                .then(function () {
                    return ProductRepository.listAvailableOneTimePurchaseProducts()
                },
                function catchCreate(err) {
                    console.log('Create failed: ' + err);
                })
                .then(function (oneTimePurchaseProductList) {

                    function verifyNoMatchingOneTimePurchase(productList) {
                        var found = false;
                        var productToMatch = unavailableProduct;

                        productList.forEach(function (product) {
                            if (product.id === productToMatch.id) {
                                found = true;
                            }
                        });

                        return !found;
                    }

                    return expect(oneTimePurchaseProductList).to.satisfy(verifyNoMatchingOneTimePurchase);
                },
                function catchList(err) {
                    console.log('listAvailableOneTimePurchaseProducts failed: ' + err);
                })
        });
    });
}

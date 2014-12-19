var chai   = require( 'chai' )
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
    , ProductRepository = require('../Entity/ProductRepository' )
    , VendorRepository = require('../Entity/VendorRepository' )
    , LicenseRepository = require('../Entity/LicenseRepository' )
    ;

chai.use( chaiAsPromised );

var yesterday = moment().subtract(1, 'week');
var tomorrow = moment().add(1, 'week');


function validProductData() {
    return {
        type: 'Product',
        name: 'Valid Product',
        isActive: true,
        vendor: 'fake-vendor-id'
    };
}
function invalidProductData() {
    return {
        type: 'Product'
    };
}

test.run('Product', validProductData, invalidProductData);

function availableOneTimePurchaseProduct() {
    var product = validProductData();
    product.id = uuid.v4();
    product.cycleType = 'One-Time Purchase';
    product.oneTimePurchase = { availableForPurchaseThrough: tomorrow.toISOString() };
    return product;
}
function unavailableOneTimePurchaseProduct() {
    var product = validProductData();
    product.id = uuid.v4();
    product.cycleType = 'One-Time Purchase';
    product.oneTimePurchase = { availableForPurchaseThrough: yesterday.toISOString() };
    return product;
}

describe('Converting referenced entities', function() {

    //The Repository should store references to sub-Entities as their ID, not the whole object
    describe('Stripping referenced entities on create/update', function() {
        //we can't test this without looking at the Store directly
        it('should convert objects to id');
    });

    describe('Expanding referenced entities on load', function() {

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
                    return ProductRepository.create(product);
                })
                .then(function (productId) {
                    return ProductRepository.load(productId);
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

            return ProductRepository.create(product)
            .then(function (productId) {
                return ProductRepository.load(productId);
            })
            .then(function (loadedProduct) {
                return expect(loadedProduct.vendor).to.be.an('object').and.have.property('name');
            });
        });
    });
});


describe('ProductRepository.listOneTimePurchaseProducts()', function() {
    it('should list a product that is available through tomorrow', function () {
        var availableProduct = availableOneTimePurchaseProduct();

        return ProductRepository.create(availableProduct)
            .then(function() {
                return ProductRepository.listAvailableOneTimePurchaseProducts()
            })
            .then(function(oneTimePurchaseProductList) {

                function findMatchingOneTimePurchase( productList ){
                    var result = false;
                    var productToMatch = availableProduct;

                    productList.forEach(function( product ){
                        if ( product.id === productToMatch.id ){
                            result = true;
                        }
                    });

                    return result;
                }

                return expect(oneTimePurchaseProductList).to.satisfy( findMatchingOneTimePurchase );
            });
    });

    it('should not list a product that was available through yesterday', function () {
        var unavailableProduct = unavailableOneTimePurchaseProduct();

        return ProductRepository.create(unavailableProduct)
            .then(function () {
                return ProductRepository.listAvailableOneTimePurchaseProducts()
            },
            function catchCreate(err) {
                console.log('Create failed: ' + err);
            })
            .then(function (oneTimePurchaseProductList) {

                function verifyNoMatchingOneTimePurchase( productList ){
                    var found = false;
                    var productToMatch = unavailableProduct;

                    productList.forEach(function( product ){
                        if ( product.id === productToMatch.id ){
                            found = true;
                        }
                    });

                    return !found;
                }

                return expect(oneTimePurchaseProductList).to.satisfy( verifyNoMatchingOneTimePurchase );
            },
            function catchList(err) {
                console.log('listAvailableOneTimePurchaseProducts failed: ' + err);
            })
    });
});

describe('ListProductsForLicenseId View', function () {
    var license1 = { id: uuid.v4(), type: "License", name: "my license 1 name", isActive: true};
    var license2 = { id: uuid.v4(), type: "License", name: "my license 2 name", isActive: true};
    var product1 = { id: uuid.v4(), type: "Product", name: "my product 1 name", isActive: true, license: license1.id, vendor: "bogus"};
    var product2 = { id: uuid.v4(), type: "Product", name: "my product 2 name", isActive: true, license: license1.id, vendor: "bogus"};
    var product3 = { id: uuid.v4(), type: "Product", name: "my product 3 name", isActive: true, license: license2.id, vendor: "bogus"};
    var product4 = { id: uuid.v4(), type: "Product", name: "my product 3 name", isActive: true, vendor: "bogus"};

    it('should return products associated with a license', function(){
        return ProductRepository.create( product1 )
            .then( function() {
                return ProductRepository.create( product2 );
            })
            .then (function () {
                return ProductRepository.create( product3 );
            })
            .then (function () {
                return ProductRepository.create( product4 );
            })
            .then(function(){
                return ProductRepository.listProductsForLicenseId( license1.id );
            })
            .then(function ( productList ) {

                function verifyAllProductsHaveLicense( productList ){
                    var match = true;
                    var licenseToMatch = license1;

                    productList.forEach(function( product ){
                        if ( product.license !== licenseToMatch.id ){
                            match = true;
                        }
                    });

                    return match;
                }

                return expect(productList).to.be.an('array').and.have.length(2).and.satisfy( verifyAllProductsHaveLicense);
            });
    });
});


describe('Adding functions to Product instances', function(){
    it('should add a getIsActive method to instances of Product', function(){
        var product = validProductData();

        return ProductRepository.create( product )
            .then( function( productId) {
                return ProductRepository.load( productId );
            })
            .then( function( loadedProduct ){
                return expect( loadedProduct.getIsActive).to.be.a('function');
            });
    });

    describe('the Product.getIsActive method', function(){
        it('should return true for an active Product with an active Vendor', function(){
            var vendor = { id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: true};
            var product = { id: uuid.v4(), type: "Product", name: "my product name", isActive: true};

            return VendorRepository.create( vendor )
                .then( function() {
                    product.vendor = vendor;
                    return ProductRepository.create( product );
                })
                .then (function () {
                    return ProductRepository.load(product.id);
                })
                .then (function (loadedProduct) {
                    return expect(loadedProduct.getIsActive()).to.equal(true);
                });
        });

        it('should return false for an active Product with an inactive Vendor', function(){

            var vendor = { id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: false};
            var product = { id: uuid.v4(), type: "Product", name: "my product name", isActive: true};

            return VendorRepository.create( vendor )
                .then( function() {
                    product.vendor = vendor;
                    return ProductRepository.create( product );
                })
                .then (function () {
                return ProductRepository.load(product.id);
            })
                .then (function (loadedProduct) {
                return expect(loadedProduct.getIsActive()).to.equal(false);
            });
        });

        it('should return false for an inactive Product with an inactive Vendor', function(){

            var vendor = { id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: false};
            var product = { id: uuid.v4(), type: "Product", name: "my product name", isActive: false};

            return VendorRepository.create( vendor )
                .then( function() {
                    product.vendor = vendor;
                    return ProductRepository.create( product );
                })
                .then (function () {
                return ProductRepository.load(product.id);
            })
                .then (function (loadedProduct) {
                return expect(loadedProduct.getIsActive()).to.equal(false);
            });
        });

        it('should return false for an inactive Product with an active Vendor', function(){
            var vendor = { id: uuid.v4(), type: "Vendor", name: "my vendor name", isActive: true};
            var product = { id: uuid.v4(), type: "Product", name: "my product name", isActive: false};

            return VendorRepository.create( vendor )
                .then( function() {
                    product.vendor = vendor;
                    return ProductRepository.create( product );
                })
                .then (function () {
                return ProductRepository.load(product.id);
            })
                .then (function (loadedProduct) {
                return expect(loadedProduct.getIsActive()).to.equal(false);
            });
        });

        //The Repository call will fail when trying to load a Product with no Vendor, but the Vendor should fail
        it('should return false for an inactive Product with an empty Vendor');
        it('should return true for an active Product with an empty Vendor');
    });
});
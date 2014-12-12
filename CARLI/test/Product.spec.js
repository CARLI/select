var chai   = require( 'chai' )
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
    , ProductRepository = require('../Entity/ProductRepository' )
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

/* We changed the product create method to clone the object, so the test below need to change and not rely on
 * the original instance being modified by create() */
describe('ProductRepository.listOneTimePurchaseProducts()', function() {
    it('should list a product that is available through tomorrow', function () {
        var availableProduct = availableOneTimePurchaseProduct();

        return ProductRepository.create(availableProduct)
            .then(function() {
                return ProductRepository.listAvailableOneTimePurchaseProducts()
            },
            function catchCreate(err) {
                console.log('Create failed: ' + err);
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
            },
            function catchList(err) {
                console.log('listAvailableOneTimePurchaseProducts failed: ' + err);
            })
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
});
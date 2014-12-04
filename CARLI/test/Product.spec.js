var chai   = require( 'chai' )
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
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

describe('ProductRepository.listOneTimePurchaseProducts()', function() {
    var ProductRepository = require('../Entity/ProductRepository' );

    it('should list a product that is available through tomorrow', function () {
        var availableProduct = availableOneTimePurchaseProduct();

        return ProductRepository.create(availableProduct)
            .then(function() {
                return ProductRepository.listAvailableOneTimePurchaseProducts()
            },
            function catchCreate(err) {
                console.log('Create failed: ' + err);
            })
            .then(function(otpList) {
                return expect(otpList).to.deep.include.members([availableProduct]);
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
            .then(function (otpList) {
                return expect(otpList).to.not.deep.include.members([unavailableProduct]);
            },
            function catchList(err) {
                console.log('listAvailableOneTimePurchaseProducts failed: ' + err);
            })
    });
});

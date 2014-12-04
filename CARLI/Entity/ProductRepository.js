var Entity = require('../Entity')
  , moment = require('moment')
  , Q = require('q')
    ;

var ProductRepository = Entity('Product');

ProductRepository.listAvailableOneTimePurchaseProducts = function(){
    var deferred = Q.defer();

    ProductRepository.list()
        .then(function (allProducts) {
            var p = allProducts
                .filter(isOneTimePurchaseProduct)
                .filter(isActive)
                .filter(isAvailableToday);
            deferred.resolve(p);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

function isOneTimePurchaseProduct( product ){
    return product.cycleType === 'One-Time Purchase';
}
function isActive( product ){
    return product.isActive === true;
}
function isAvailableToday( product ){
    var throughDate = moment(product.oneTimePurchase.availableForPurchaseThrough);
    var lastMidnight = moment().startOf('day');
    return throughDate.isAfter(lastMidnight);
}

module.exports = ProductRepository;

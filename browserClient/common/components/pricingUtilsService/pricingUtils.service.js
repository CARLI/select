angular.module('common.pricingUtils')
    .service('pricingUtils', function() {
        function roundPriceToCent(price) {
            return Math.round(price * 100) / 100;
        }

        return {
            roundPriceToCent: roundPriceToCent
        };
    });

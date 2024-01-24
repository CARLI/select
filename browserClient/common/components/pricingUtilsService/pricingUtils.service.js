angular.module('common.pricingUtils')
    .service('pricingUtils', function() {
        function roundPriceToCent(price) {
            if(isNaN(price))
                return price;
            return Math.round(price * 100) / 100;
        }

        function roundPricesForOffering(offering) {
            const pricing = offering.pricing;
            pricing.site = roundPriceToCent(pricing.site);
            pricing.su?.forEach(row => {
                row.price = roundPriceToCent(row.price);
            });
        }

        return {
            roundPriceToCent: roundPriceToCent,
            roundPricesForOffering: roundPricesForOffering
        };
    });

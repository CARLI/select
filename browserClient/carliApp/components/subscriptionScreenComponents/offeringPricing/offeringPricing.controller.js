angular.module('carli.subscriptionScreenComponents.offeringPricing')
.controller('offeringPricingController', offeringPricingController);

function offeringPricingController($scope, offeringService){
    var vm = this;

    activate();

    function activate() {
        watchOfferingPrice();
    }

    function watchOfferingPrice() {
        $scope.$watch('vm.offering.pricing.site', siteLicensePricingWasUpdated);
    }

    function siteLicensePricingWasUpdated(oldPrice, newPrice) {
        if (oldPrice !== newPrice)
            updateSiteLicensePricingTimestamp();
        copyFundedPriceToViewModel();
    }

    function updateSiteLicensePricingTimestamp() {
        vm.offering.siteLicensePriceUpdated = new Date().toISOString();
    }

    function copyFundedPriceToViewModel() {
        vm.fundedPrice = offeringService.getFundedSiteLicensePrice(vm.offering);
    }
}

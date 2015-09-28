angular.module('carli.subscriptionScreenComponents.offeringPricing')
.controller('offeringPricingController', offeringPricingController);

function offeringPricingController($scope, offeringService){
    var vm = this;

    activate();

    function activate() {
        watchOfferingPrice();
    }

    function watchOfferingPrice() {
        $scope.$watch('vm.offering.pricing.site', copyFundedPriceToViewModel);
    }

    function copyFundedPriceToViewModel() {
        console.log('updated price');
        vm.fundedPrice = offeringService.getFundedSiteLicensePrice(vm.offering);
    }
}

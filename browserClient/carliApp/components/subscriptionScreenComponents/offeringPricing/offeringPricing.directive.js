angular.module('carli.subscriptionScreenComponents.offeringPricing')
.directive('offeringPricing', function(){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/subscriptionScreenComponents/offeringPricing/offeringPricing.html',
        scope: {
            year: '=',
            offering: '=',
            editMode: '=',
            showPreviousYear: '='
        },
        controller: offeringPricingController,
        controllerAs: 'vm',
        bindToController: true
    };
});
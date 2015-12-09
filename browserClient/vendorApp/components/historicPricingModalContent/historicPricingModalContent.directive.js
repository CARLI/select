angular.module('vendor.historicPricingModalContent')
    .directive('historicPricingModalContent', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/historicPricingModalContent/historicPricingModalContent.html',
            scope: {
                showing: '=',
                currentYear: "=",
                offerings: "="
            },
            controller: 'historicPricingModalContentController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

angular.module('vendor.historicPricingModalContent')
    .directive('historicPricingModalContent', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/historicPricingModalContent/historicPricingModalContent.html',
            scope: {
                showing: '=',
                cycle: '=',
                libraries: '=',
                products: '=',
                offerings: '=',
                selectedLibraryIds: '=',
                selectedProductIds: '='
            },
            controller: 'historicPricingModalContentController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

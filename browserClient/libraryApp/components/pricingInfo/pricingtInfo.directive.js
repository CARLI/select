angular.module('library.pricingInfo')
    .directive('pricingInfo', function() {
        return {
            restrict: 'E',
            templateUrl: '/libraryApp/components/pricingInfo/pricingInfo.html',
            scope: {
                pricing: '='
            },
            controller: 'pricingInfoController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

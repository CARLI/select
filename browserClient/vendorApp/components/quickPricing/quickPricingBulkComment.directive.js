angular.module('vendor.quickPricing')
    .directive('quickPricingBulkComment', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingBulkComment.html',
            scope: {
                quickPricingArguments: '='
            },
            controller: 'quickPricingBulkCommentController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

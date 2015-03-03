angular.module('carli.sections.subscriptions.productsAvailable')
    .directive('productsAvailableByVendor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/productsAvailable/productsAvailableByVendor.html',
            scope: {
                notifyParentOfSave: '=onOfferingSaved'
            },
            controller: 'productsAvailableByVendorController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

angular.module('vendor.cycleChooser')
    .directive('cycleChooser', function() {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/vendorApp/components/cycleChooser/cycleChooser.html',
            controller: 'cycleChooserController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

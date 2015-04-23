angular.module('vendor.userLookup')
    .directive('userLookup', function(){
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/vendorApp/components/userLookup/userLookup.html',
            controller: 'userLookupController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

angular.module('vendor.navBar')
.directive('navBar', function() {
    return {
        restrict: 'A',
        templateUrl: '/vendorApp/components/navBar/navBar.html'
    };
});

angular.module('vendor.vendorHeader')
.directive('vendorHeader', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '/vendorApp/components/vendorHeader/vendorHeader.html'
    };
});

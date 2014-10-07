angular.module('carli.sections.section1')
    .controller('section1Controller', function ($scope, vendorService) {
        $scope.vendors = vendorService.getVendors();
    });

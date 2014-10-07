angular.module('carli.sections.section1')
    .controller('section1Controller', section1Controller);

function section1Controller($scope, vendorService) {
    $scope.vendors = vendorService.getVendors();
}
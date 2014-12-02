angular.module('carli.sections.licenses.edit')
    .controller('editLicensePageController', editLicensePageController);

function editLicensePageController( $routeParams, $location ) {
    var vm = this;
    vm.licenseId = $routeParams.id;
    vm.afterLicenseSubmit = routeToLicenseList;

    function routeToLicenseList() {
        $location.path('/license');
    }
}

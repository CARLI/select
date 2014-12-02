angular.module('carli.sections.licenses.edit')
    .controller('editLicensePageController', editLicensePageController);

function editLicensePageController( $routeParams ) {
    var vm = this;
    vm.licenseId = $routeParams.id;
    console.log('hello');
    console.log(vm.licenseId);
    vm.afterVendorSubmit = routeToLicenseList;

    function routeToLicenseList() {
        $location.path('/license');
    }
}

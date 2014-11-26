angular.module('carli.sections.vendors.edit')
    .controller('editVendorPageController', editVendorPageController);

function editVendorPageController( $routeParams, $location ) {
    var vm = this;
    vm.vendorId = $routeParams.id;
    vm.afterVendorSubmit = routeToVendorList;

    function routeToVendorList() {
        $location.path('/vendor');
    }
}

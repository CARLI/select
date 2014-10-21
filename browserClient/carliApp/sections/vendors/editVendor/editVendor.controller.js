angular.module('carli.sections.vendors.edit')
.controller('editVendorController', editVendorController);

function editVendorController( $routeParams, vendorService ){
    var vm = this;

    vm.vendor = {};

    var vendorId = $routeParams.id;

    if ( vendorId !== 'new' ) {
        vm.vendor = vendorService.getVendor(vendorId);
    }
}

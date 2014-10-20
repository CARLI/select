angular.module('carli.sections.vendors.edit')
.controller('editVendorController', editVendorController);

function editVendorController( $routeParams, vendorService ){

    this.vendor = {};

    var vendorId = $routeParams.id;

    if ( vendorId !== 'new' ) {
        this.vendor = vendorService.getVendor(vendorId);
    }
}

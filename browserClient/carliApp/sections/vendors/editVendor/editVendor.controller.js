angular.module('carli.sections.vendors.edit')
.controller('editVendorController', function( $routeParams, vendorService ){

        var vendorId = $routeParams.id;

        this.vendor = vendorService.getVendor(vendorId);
});

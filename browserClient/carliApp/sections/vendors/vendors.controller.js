angular.module('carli.sections.vendors')
.controller('vendorsController', function( vendorService ){

        this.vendorList = vendorService.getVendorList();
});

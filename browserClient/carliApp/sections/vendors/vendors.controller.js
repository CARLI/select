angular.module('carli.sections.vendors')
.controller('vendorsController', function( vendorService ){
    var vm = this;

    vm.vendorList = vendorService.getVendorList();
    vm.activeFilterState = 'Active';
});

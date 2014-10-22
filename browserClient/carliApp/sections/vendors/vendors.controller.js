angular.module('carli.sections.vendors')
.controller('vendorsController', vendorController);

function vendorController( vendorService ){
    var vm = this;

    vm.vendorList = vendorService.list();
    vm.activeFilterState = 'Active';
}

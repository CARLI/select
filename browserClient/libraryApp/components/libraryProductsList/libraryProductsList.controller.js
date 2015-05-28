angular.module('library.libraryProductsList')
.controller('libraryProductsListController', libraryProductsListController);

function libraryProductsListController( controllerBaseService, cycleService ){
    var vm = this;

    vm.loadingPromise = null;
    vm.selectedOfferings = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        funded: ['product.funded','product.name'],
        pricing: ['pricing.site','product.name']
    };

    controllerBaseService.addSortable(vm, vm.sortOptions.productName);
    activate();

    function activate(){
        vm.loadingPromise = cycleService.listSelectionsForCycle( vm.cycle)
            .then(function( offerings ){
                vm.selectedOfferings = offerings;
            });
    }

}
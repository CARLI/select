angular.module('library.libraryProductsList')
.controller('libraryProductsListController', libraryProductsListController);

function libraryProductsListController( $q, controllerBaseService, cycleService, productService ){
    var vm = this;

    vm.loadingPromise = null;
    vm.selectedOfferings = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        license: ['product.license.name','product.name'],
        su: ['selection.users','product.name'],
        cost: ['selection.price','product.name']
    };

    controllerBaseService.addSortable(vm, vm.sortOptions.productName);
    activate();

    function activate(){
        vm.loadingPromise = cycleService.listSelectionsForCycle(vm.cycle)
            .then(function( offerings ){
                console.log('listing '+offerings.length+' selections for '+vm.cycle.name);
                console.log(typeof offerings);
                vm.selectedOfferings = offerings;
            });
    }

}
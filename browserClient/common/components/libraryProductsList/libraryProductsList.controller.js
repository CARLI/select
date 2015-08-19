angular.module('common.libraryProductsList')
.controller('libraryProductsListController', libraryProductsListController);

function libraryProductsListController( $q, controllerBaseService, cycleService ){
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

    vm.selectionTotal = selectionTotal;

    controllerBaseService.addSortable(vm, vm.sortOptions.productName);
    activate();

    function activate(){
        vm.loadingPromise = cycleService.listSelectionsForCycle(vm.cycle, vm.libraryId)
            .then(function( offerings ){
                vm.selectedOfferings = offerings;
            });
    }

    function selectionTotal(){
        var total = 0;

        if ( vm.selectedOfferings ){
            vm.selectedOfferings.forEach(function(offering){
                total += offering.selection.price;
            });
        }

        return total;
    }

}
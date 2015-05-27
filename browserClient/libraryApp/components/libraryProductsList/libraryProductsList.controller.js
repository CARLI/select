angular.module('library.libraryProductsList')
.controller('libraryProductsListController', libraryProductsListController);

function libraryProductsListController( cycleService ){
    var vm = this;

    vm.loadingPromise = null;
    vm.selectedOfferings = [];

    activate();

    function activate(){
        vm.loadingPromise = cycleService.listSelectionsForCycle( vm.cycle)
            .then(function( offerings ){
                vm.selectedOfferings = offerings;
            });
    }

}
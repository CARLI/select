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
        vm.loadingPromise = cycleService.listSelectionsForCycle( vm.cycle)
            .then(populateProductsForOfferings)
            .then(function( offerings ){
                vm.selectedOfferings = offerings;
            });

        function populateProductsForOfferings( offeringsList ){
            return $q.all(offeringsList.map(loadProduct));

            function loadProduct(offering){
                if (typeof offering.product.vendor == 'object' && offering.product.license == 'object') {
                    return $q.when(offering);
                } else {
                    return productService.load(offering.product.id)
                        .then(function(product){
                            offering.product = product;
                            return offering;
                        });
                }
            }
        }
    }

}
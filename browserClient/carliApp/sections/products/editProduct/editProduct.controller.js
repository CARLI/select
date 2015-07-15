angular.module('carli.sections.products.edit')
    .controller('editProductPageController', editProductPageController);

function editProductPageController( $routeParams, cycleService, productService ) {
    var vm = this;
    var cycleId = $routeParams.cycleId;
    var productId = $routeParams.productId;

    vm.cycle = null;
    vm.loadingPromise = null;
    vm.product = null;

    activate();

    function activate(){
        console.log('editProductPageController init with cycle '+cycleId);
        vm.loadingPromise = cycleService.load(cycleId)
            .then(loadProduct)
            .then(saveProductToVm);
    }

    function loadProduct(cycle){
        console.log('  loaded '+cycle.name);
        vm.cycle = cycle;
        return productService.load(productId);
    }

    function saveProductToVm(product){
        console.log('  loaded '+product.name);
        vm.product = product;
        return product;
    }
}
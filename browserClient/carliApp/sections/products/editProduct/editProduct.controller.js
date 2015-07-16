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
        vm.loadingPromise = cycleService.load(cycleId)
            .then(loadProduct)
            .then(saveProductToVm);
    }

    function loadProduct(cycle){
        vm.cycle = cycle;
        return productService.load(productId, cycle);
    }

    function saveProductToVm(product){
        product.cycle = vm.cycle; //this cycle is full-expanded and has instance functions like getDatabaseName()
        vm.product = product;
        return product;
    }
}
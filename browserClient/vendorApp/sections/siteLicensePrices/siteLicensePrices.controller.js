angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($q, libraryService, productService){
    var vm = this;
    vm.loadingPromises = [];

    activate();

    function activate() {
        vm.loadingPromise = $q.all(
            loadLibraries(),
            loadProducts()
        );
    }

    function loadLibraries() {
        return libraryService.list().then(function (libraries) {
            vm.libraries = libraries;
        });
    }
    function loadProducts() {
        return productService.list().then(function (products) {
            vm.products = products;
        });
    }
}

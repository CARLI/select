angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($q, libraryService, productService, currentUser){
    var vm = this;
    vm.loadingPromises = [];
    vm.viewOptions = {};

    vm.getPrice = getPrice;

    activate();

    function activate() {
        vm.viewOptions = {
            size: true,
            type: true,
            years: true,
            priceCap: true
        };

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
        return productService.listProductsForVendorId( currentUser.vendor.id ).then(function (products) {
            vm.products = products;
        });
    }

    function getPrice(){
        return '';
    }
}

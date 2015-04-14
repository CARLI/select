angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($q, $filter, libraryService, productService, currentUser){
    var vm = this;
    vm.loadingPromises = [];
    vm.viewOptions = {};
    
    activate();

    function activate() {
        vm.viewOptions = {
            size: true,
            type: true,
            years: true,
            priceCap: true
        };

        vm.loadingPromise = loadLibraries()
            .then(loadProducts)
            .then(buildPriceArray)
            .then(buildPricingGrid);
    }

    function loadLibraries() {
        return libraryService.list().then(function (libraries) {
            vm.libraries = libraries;
        });
    }

    function loadProducts() {
        return productService.listProductsWithOfferingsForVendorId( currentUser.vendor.id ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
        });
    }

    function buildPriceArray() {

        vm.priceForLibraryByProduct = {};

        vm.products.forEach(function (product) {
            vm.priceForLibraryByProduct[product.id] = {};

            product.offerings.forEach(function (offering) {
                vm.priceForLibraryByProduct[product.id][offering.library.id] = offering.pricing.site;
            });
        });
    }

    function buildPricingGrid() {
        var priceRows = $('<div>').attr('id','price-rows');

        vm.libraries.forEach(function (library) {
            var row = generateLibraryRow();
            vm.products.forEach(function (product) {
                row.append( generateProductCell(library, product));
            });
            priceRows.append(row);
        });

        $('#price-rows').replaceWith(priceRows);

        function generateLibraryRow() {
            return $('<div class="price-row">');
        }
        function generateProductCell(library, product) {
            var price = vm.priceForLibraryByProduct[product.id][library.id] || 0;
            return $('<div class="column">').append('<input type="text" value="' + price + '">');
        }
    }
}

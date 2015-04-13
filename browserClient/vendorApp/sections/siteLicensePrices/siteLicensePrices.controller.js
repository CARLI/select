angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($q, $filter, libraryService, productService, currentUser){
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
        return productService.listProductsWithOfferingsForVendorId( currentUser.vendor.id ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');

            buildPriceArray();
            buildPricingGrid();
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

    function getPrice(product, library){
        var offeringsForLibrary = product.offerings.filter(function (offering) {
            return offering.library.id == library.id;
        });
        return (offeringsForLibrary.length > 0) ? offeringsForLibrary[0].pricing.site : 0;
    }

    function buildPricingGrid() {
        /*
         <div class="price-row" ng-repeat="library in ::vm.libraries">
         <div class="column" ng-repeat="product in ::vm.products | orderBy:'name'">
         <input type="text" value="{{ ::vm.priceForLibraryByProduct[product.id][library.id] }}">
         </div>
         </div>
         */
        var priceRows = $('<div>');


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

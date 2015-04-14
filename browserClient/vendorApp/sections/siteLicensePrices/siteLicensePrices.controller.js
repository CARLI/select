angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($q, $filter, cycleService, libraryService, offeringService, productService, currentUser){
    var vm = this;
    vm.loadingPromise = null;
    vm.viewOptions = {};
    vm.selectedProductIds = {};

    vm.saveOfferings = saveOfferings;

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
            initializeSelectedProductIds();
        });
    }

    function initializeSelectedProductIds() {
        vm.products.forEach(function(product) {
            vm.selectedProductIds[product.id] = false;
        });
    }

    function buildPriceArray() {

        vm.offeringsForLibraryByProduct = {};

        vm.products.forEach(function (product) {
            vm.offeringsForLibraryByProduct[product.id] = {};

            product.offerings.forEach(function (offering) {
                vm.offeringsForLibraryByProduct[product.id][offering.library.id] = offering;
            });
        });
    }

    function buildPricingGrid() {
        var priceRows = $('<div>').attr('id','price-rows');

        vm.libraries.forEach(function (library) {
            var row = generateLibraryRow();
            vm.products.forEach(function (product) {
                row.append( generateOfferingCell(library, product));
            });
            priceRows.append(row);
        });

        $('#price-rows').replaceWith(priceRows);

        function generateLibraryRow() {
            return $('<div class="price-row">');
        }
        function generateOfferingCell(library, product) {
            var offering = vm.offeringsForLibraryByProduct[product.id][library.id] || { pricing: { site: 0 }};
            var price = offering.pricing.site;
            var offeringCell = $('<div class="column offering">').append('<input type="number" step=".01" min="0" value="' + price + '">');

            offeringCell.data('libraryId', library.id);
            offeringCell.data('productId', product.id);

            return offeringCell;
        }
    }

    function saveOfferings(){
        var cycle = cycleService.getCurrentCycle();
        var changedOfferings = [];
        var newOfferings = [];
        var offeringCells = $('#price-rows .offering');

        offeringCells.each(function(index, element){
            var offeringCell = $(element);
            var libraryId = offeringCell.data('libraryId');
            var productId = offeringCell.data('productId');
            var offering = vm.offeringsForLibraryByProduct[productId][libraryId];
            var newPrice = parseFloat( offeringCell.find('input').val());

            if ( !offering ){
                if ( newPrice !== 0 ){
                    offering = generateNewOffering(libraryId, productId, cycle, newPrice);
                    newOfferings.push(offering);
                }
            }
            else if ( newPrice != offering.pricing.site ){
                offering.pricing.site = newPrice;
                changedOfferings.push(offering);
            }
        });

        vm.loadingPromise = saveAllOfferings( newOfferings, changedOfferings );
    }

    function generateNewOffering(libraryId, productId, cycle, newPrice) {
        return {
            cycle: cycle,
            library: libraryId.toString(),
            product: productId,
            pricing: {
                site: newPrice
            }
        };
    }

    function saveAllNewOfferings( newOfferings ){
        return $q.all(newOfferings.map(offeringService.create));
    }

    function saveAllChangedOfferings( changedOfferings ){
        return $q.all(changedOfferings.map(offeringService.update));
    }

    function saveAllOfferings( newOfferings, changedOfferings ){
        var deferred = $q.defer();

        $q.all( [ saveAllNewOfferings(newOfferings), saveAllChangedOfferings(changedOfferings) ] )
            .then(function(arrays){
                var count = arrays[0].length + arrays[1].length;
                console.log('saved '+count+' offerings');
                deferred.resolve();
            })
            .catch(function(err){
                console.log(err);
                deferred.reject(err);
            });

        return deferred.promise;
    }
}

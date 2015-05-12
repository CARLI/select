angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($scope, $q, $filter, cycleService, libraryService, offeringService, productService, userService, siteLicensePricesCsv){
    var vm = this;
    vm.loadingPromise = null;
    vm.viewOptions = {};
    vm.selectedProductIds = {};
    vm.selectedLibraryIds = {};
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.quickPricingCallback = quickPricingCallback;
    vm.saveOfferings = saveOfferings;
    vm.downloadCsv = downloadCsv;

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
            vm.libraries = $filter('orderBy')(libraries, 'name');
            initializeSelectedLibraryIds();
        });
    }

    function loadProducts() {
        return productService.listProductsWithOfferingsForVendorId( userService.getUser().vendor.id ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
            initializeSelectedProductIds();
        });
    }

    function initializeSelectedLibraryIds() {
        vm.libraries.forEach(function(library) {
            vm.selectedLibraryIds[library.id] = true;
        });
        $scope.$watchCollection(getSelectedLibraryIds, updateVisibilityOfRowsForSelectedLibraries);
        function getSelectedLibraryIds() { return vm.selectedLibraryIds; }
    }

    function initializeSelectedProductIds() {
        vm.products.forEach(function(product) {
            vm.selectedProductIds[product.id] = true;
        });
        $scope.$watchCollection(getSelectedProductIds, updateVisibilityOfCellsForSelectedProducts);
        function getSelectedProductIds() { return vm.selectedProductIds; }
    }

    function updateVisibilityOfRowsForSelectedLibraries(selectedEntities) {
        if (selectedEntities) {
            Object.keys(selectedEntities).forEach(function (entityId) {
                var displayValueLabel = selectedEntities[entityId] ? 'flex' : 'none';
                $('.pricing-grid-row-labels .' + entityId).css('display', displayValueLabel);

                var displayValuePrice = selectedEntities[entityId] ? 'table-row' : 'none';
                $('.pricing-grid .' + entityId).css('display', displayValuePrice);

            });
        }
    }

    function updateVisibilityOfCellsForSelectedProducts(selectedEntities) {
        if (selectedEntities) {
            Object.keys(selectedEntities).forEach(function (entityId) {
                var displayValue = selectedEntities[entityId] ? 'table-cell' : 'none';
                $('.' + entityId).css('display', displayValue);
            });
        }
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
        vm.libraries.forEach(function (library) {
            var row = generateLibraryRow(library);
            vm.products.forEach(function (product) {
                row.append(generateOfferingCell(library, product));
            });
            $('.pricing-grid').append(row);
        });

        function generateLibraryRow(library) {
            var row = $('<div class="price-row">');
            row.addClass('' + library.id);
            return row;
        }
        function generateOfferingCell(library, product) {
            var offering = vm.offeringsForLibraryByProduct[product.id][library.id] || { pricing: { site: 0 }};
            var price = offering.pricing.site;
            var offeringWrapper = $('<div class="column offering input">');
            var offeringCell = offeringWrapper.append(createReadOnlyOfferingCell(price));

            offeringWrapper.on('click', function() {
                $(this).children().first().focus();
            });

            offeringCell.data('libraryId', library.id);
            offeringCell.data('productId', product.id);
            offeringCell.addClass(product.id);

            return offeringCell;
        }
    }

    function createReadOnlyOfferingCell(price) {
        var cell = $('<div tabindex="0" class="price">'+price+'</div>');
        cell.on('focus', makeEditable);
        return cell;

        function makeEditable() {
            var price = $(this).text();
            var input = createEditableOfferingCell(price);
            $(this).replaceWith(input);
            input.focus().select();
        }
    }
    function createEditableOfferingCell(price) {
        var cell = $('<input class="price-editable" type="text" step=".01" min="0" value="' + price + '">');
        cell.on('blur', makeReadOnly);
        return cell;

        function makeReadOnly() {
            var price = $(this).val();
            var div = createReadOnlyOfferingCell(price);
            $(this).replaceWith(div);
        }
    }

    function saveOfferings(){
        var cycle = cycleService.getCurrentCycle();
        var changedOfferings = [];
        var newOfferings = [];
        var offeringCells = $('#site-pricing-grid .offering');

        offeringCells.each(function(index, element){
            var offeringCell = $(element);
            var libraryId = offeringCell.data('libraryId');
            var productId = offeringCell.data('productId');
            var offering = vm.offeringsForLibraryByProduct[productId][libraryId];
            var newPrice = parseFloat( offeringCell.find('input').val());

            if ($(element).is(":visible")) {
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
            }
        });

        vm.loadingPromise = saveAllOfferings( newOfferings, changedOfferings );
        return vm.loadingPromise;
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

    function quickPricingCallback(mode, value) {
        var selectedLibraryIds = Object.keys(vm.selectedLibraryIds).filter(function (libraryId) {
            return vm.selectedLibraryIds[libraryId];
        });
        var selectedProductIds = Object.keys(vm.selectedProductIds).filter(function (productId) {
            return vm.selectedProductIds[productId];
        });


        $('#site-pricing-grid .offering').each(function(i, cell) {
            var $cell = $(cell);
            if (selectedLibraryIds.indexOf($cell.data('libraryId').toString()) != -1 &&
                selectedProductIds.indexOf($cell.data('productId')) != -1) {

                if (mode == 'dollarAmount') {
                    $cell.find('.price').text(value);
                } else if (mode == 'percentageIncrease') {
                    var originalValue = parseFloat($cell.text());
                    var newValue = (100 + value)/100 * originalValue;
                    // TODO round this to the nearest cent?
                    $cell.find('.price').text( newValue );
                }
            }
        });
    }

    function downloadCsv() {
        //vm.loadingPromise = saveOfferings()
        //    .then(generateCsvData)
        //    .then(triggerDownload);

        generateCsvData()
            .then(triggerDownload)
            .catch(function (err) {
                console.log('CSV generation failed', err);
            });

        function generateCsvData() {
            return siteLicensePricesCsv(vm.viewOptions, getCsvProductList(), getCsvLibraryList(), vm.offeringsForLibraryByProduct);
        }

        function triggerDownload(csvString) {
            console.log('makeing Blob');
            var blob = new Blob([csvString], {type: "text/csv;charset=utf-8"});
            console.log('saving');
            console.log(saveAs);
            saveAs(blob, "stylophone.csv");
        }

        return vm.loadingPromise;

        function getCsvProductList() {
            return vm.products.filter(function (product) {
                return vm.selectedProductIds[product.id];
            });
        }
        function getCsvLibraryList() {
            return vm.libraries.filter(function (library) {
                return vm.selectedLibraryIds[library.id];
            });
        }

    }
}

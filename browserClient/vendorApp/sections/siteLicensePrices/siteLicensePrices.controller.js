angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($scope, $q, $filter, authService, cycleService, libraryService, offeringService, productService, siteLicensePricesCsv, vendorStatusService){
    var vm = this;

    vm.loadingPromise = null;
    vm.viewOptions = {};
    vm.selectedProductIds = {};
    vm.selectedLibraryIds = {};

    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.quickPricingCallback = quickPricingCallback;
    vm.saveOfferings = saveOfferings;
    vm.downloadCsv = downloadCsv;
    vm.checkViewOption = checkViewOption;
    vm.isCommentModeEnabled = false;
    vm.toggleCommentMode = function () {
        vm.isCommentModeEnabled = !vm.isCommentModeEnabled;
    };

    activate();

    function activate() {
        affixControlsToTopOfPage();

        vm.vendorId = authService.getCurrentUser().vendor.id;

        vm.viewOptions = {
            size: true,
            type: true,
            years: true,
            priceCap: true
        };

        vm.loadingPromise = loadLibraries()
            .then(initializePricingGrid);
    }

    function affixControlsToTopOfPage() {
        var headerPinnedEvent = 'affixed.bs.affix';
        var headerUnpinnedEvent = 'affixed-top.bs.affix';

        var heightOfSiteHeader = 165;
        var heightOfPageHeader = 102;

        $('.page-header').affix({ offset: { top: heightOfSiteHeader } });

        $(document).on(headerPinnedEvent, headerPinned);
        $(document).on(headerUnpinnedEvent, headerUnpinned);

        function headerPinned(e) {
            $('#siteLicensePrices').css('top', heightOfPageHeader + 'px');
        }

        function headerUnpinned(e) {
            $('#siteLicensePrices').css('top', 'auto');
        }
    }

    function initializePricingGrid(){
        return loadProducts()
            .then(buildPriceArray)
            .then(buildPricingGrid);
    }

    function loadLibraries() {
        return libraryService.listActiveLibraries().then(function (libraries) {
            vm.libraries = $filter('orderBy')(libraries, 'name');
            initializeSelectedLibraryIds();
        });
    }

    function loadProducts() {
        return productService.listProductsWithOfferingsForVendorId( authService.getCurrentUser().vendor.id ).then(function (products) {
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
                $('#site-pricing-grid .' + entityId).css('display', displayValuePrice);

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
                offering.product = product;
                vm.offeringsForLibraryByProduct[product.id][offering.library] = offering;
            });
        });
    }

    function buildPricingGrid() {
        $('#su-pricing-grid .price-row:not(.product-name-row):not(.price-cap)').remove();

        vm.libraries.forEach(function (library) {
            var row = generateLibraryRow(library);
            vm.products.forEach(function (product) {
                row.append(generateOfferingCell(library, product));
            });
            $('#site-pricing-grid').append(row);
        });

        function generateLibraryRow(library) {
            var row = $('<div class="price-row">');
            row.addClass('' + library.id);
            return row;
        }
        function generateOfferingCell(library, product) {
            var cycle = cycleService.getCurrentCycle();
            var offering = vm.offeringsForLibraryByProduct[product.id][library.id] || { pricing: { site: '&nbsp;' }};
            var price = offering.pricing.site || '&nbsp;';
            var offeringWrapper = $('<div class="column offering input">');

            if (offeringService.getFlaggedState(offering, cycle)) {
                offeringWrapper.addClass('flagged');
                offeringWrapper.attr('title', offering.flaggedReason[0]);
            }

            var cell = createReadOnlyOfferingCell(price);
            var offeringCell = offeringWrapper.append(cell);

            offeringWrapper.on('click', function() {
                $(this).children().first().focus();
            });

            offeringCell.data('libraryId', library.id);
            offeringCell.data('fte', library.fte);
            offeringCell.data('productId', product.id);
            offeringCell.addClass(product.id);

            if ( offering.siteLicensePriceUpdated ){
                offeringCell.addClass('updated');
            }

            setCommentMarkerVisibility(cell);

            return offeringCell;
        }
    }

    function showCommentModalFor(offering) {
        vm.offeringSelectedForComment = offering;
        $('#vendor-comment-modal').modal();
    }

    function createReadOnlyOfferingCell(price) {
        var cell = $('<div tabindex="0" class="price" role="gridcell">'+price+'</div>');
        cell.on('focus', onClick);

        addCommentMarkerTo(cell);

        return cell;

        function onClick() {
            var clickAction = vm.isCommentModeEnabled ? editComment : makeEditable;
            clickAction(this);
        }

        function editComment() {
            var libraryId = cell.parent().data('libraryId');
            var productId = cell.parent().data('productId');
            var offering = vm.offeringsForLibraryByProduct[productId][libraryId];

            showCommentModalFor(offering);
            $scope.$apply(function() {
                vm.isCommentModeEnabled = false;
            });
        }

        function makeEditable(element) {
            var $this = $(element);
            var price = $this.text();
            var input = createEditableOfferingCell(price);
            $this.replaceWith(input);
            input.focus().select();
        }
    }

    function addCommentMarkerTo(cell) {
        var commentMarker = $('<div tabindex="0" class="comment-marker fa fa-comment-o"></div>');
        commentMarker.on('focus', editComment);
        cell.append(commentMarker);

        commentMarker.hide();

        return commentMarker;

        function editComment() {
            var libraryId = cell.parent().data('libraryId');
            var productId = cell.parent().data('productId');
            var offering = vm.offeringsForLibraryByProduct[productId][libraryId];

            $scope.$apply(function() {
                showCommentModalFor(offering);
            });

            $('#vendor-comment-modal').on('hidden.bs.modal', function (e) {
                setCommentMarkerVisibility(cell);
            });
        }
    }

    function setCommentMarkerVisibility(cell) {
        var offering = getOfferingForCell(cell);
        var commentMarker = cell.find('.comment-marker');

        if (offering && offering.vendorComment) {
            commentMarker.show();
        } else {
            commentMarker.hide();
        }
    }

    function getOfferingForCell(cell) {
        var productId = cell.parent().data('productId');
        var libraryId = cell.parent().data('libraryId');
        return (productId && libraryId) ? vm.offeringsForLibraryByProduct[productId][libraryId] : null;
    }

    function createEditableOfferingCell(price) {
        var cell = $('<input class="price-editable" role="textbox" type="text" step=".01" min="0" value="' + price + '">');
        cell.on('blur', makeReadOnly);
        return cell;

        function makeReadOnly() {
            var price = $(this).val();
            var div = createReadOnlyOfferingCell(price);
            $(this).replaceWith(div);
            setCommentMarkerVisibility(div);
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
            var newPrice = parseFloat( offeringCell.text() );

            if ( isNaN(newPrice) ){
                newPrice = 0;
            }

            if ($(element).is(":visible")) {
                if ( !offering ){
                    if ( newPrice !== 0 ){
                        offering = generateNewOffering(libraryId, productId, cycle, newPrice);
                        newOfferings.push(offering);
                    }
                }
                else if ( newPrice !== 0 && newPrice != offering.pricing.site ){
                    offering.pricing.site = newPrice;
                    offering.siteLicensePriceUpdated = new Date().toISOString();
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
            },
            siteLicensePriceUpdated: new Date().toISOString()
        };
    }

    function saveAllNewOfferings( newOfferings ){
        return $q.all(newOfferings.map(offeringService.create));
    }

    function saveAllChangedOfferings( changedOfferings ){
        return $q.all(changedOfferings.map(offeringService.update));
    }

    function saveAllOfferings( newOfferings, changedOfferings ){
        return $q.all([
                saveAllNewOfferings(newOfferings),
                saveAllChangedOfferings(changedOfferings)
            ])
            .then(function(arrays){
                var newOfferingsCreated = arrays[0].length;
                var oldOfferingsUpdated = arrays[1].length;
                var count = newOfferingsCreated + oldOfferingsUpdated;

                console.log('created '+newOfferingsCreated+' new offerings');
                console.log('updated '+oldOfferingsUpdated+' old offerings');

                if ( count ){
                    return initializePricingGrid();
                }
                else {
                    return $q.when();
                }
            })
            .catch(function(err){
                console.log('error saving offerings',err);
            })
            .then(updateVendorFlaggedOfferings)
            .then(updateVendorStatus)
            .then(syncData)
            .catch(syncDataError);

        function updateVendorStatus(){
            return vendorStatusService.updateVendorStatusActivity( 'Site License Prices Updated', vm.vendorId, cycleService.getCurrentCycle() );
        }

        function updateVendorFlaggedOfferings(){
            return vendorStatusService.updateVendorStatusFlaggedOfferings( vm.vendorId, cycleService.getCurrentCycle() );
        }

        function syncData(){
            return cycleService.syncDataBackToCarli();
        }

        function syncDataError( err ){
            console.log( 'error syncing data',err );
        }
    }

    function quickPricingCallback(mode, value) {
        var selectedLibraryIds = Object.keys(vm.selectedLibraryIds).filter(function (libraryId) {
            return vm.selectedLibraryIds[libraryId];
        });
        var selectedProductIds = Object.keys(vm.selectedProductIds).filter(function (productId) {
            return vm.selectedProductIds[productId];
        });


        $('#site-pricing-grid .offering').each(function(i, cell) {
            var newValue = 0;
            var $cell = $(cell);
            if (selectedLibraryIds.indexOf($cell.data('libraryId').toString()) != -1 &&
                selectedProductIds.indexOf($cell.data('productId')) != -1) {

                if (mode == 'dollarAmount') {
                    newValue = value.toFixed(2);
                    $cell.find('.price').text(newValue);
                } else if (mode == 'percentageIncrease') {
                    var originalValue = parseFloat($cell.text());
                    newValue = (100 + value)/100 * originalValue;
                    newValue = newValue.toFixed(2);
                    $cell.find('.price').text( newValue );
                }
                else if (mode == 'byFte'){
                    var fte = $cell.data('fte');
                    newValue = value * fte;
                    newValue = newValue.toFixed(2);
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
            var blob = new Blob([csvString], {type: "text/csv;charset=utf-8"});
            saveAs(blob, makeFilename());
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

        function makeFilename() {
            var vendorName = authService.getCurrentUser().vendor.name;
            var cycleName = cycleService.getCurrentCycle().name;
            return vendorName + ' ' + cycleName + ' Site License Prices.csv';
        }

    }

    function checkViewOption(option) {

        if (vm.viewOptions[option] === true ) {
            vm.viewOptions[option] = false;
        }
        else {
            vm.viewOptions[option] = true;
        }
    }
}

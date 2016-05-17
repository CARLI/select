angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($scope, $q, $filter, alertService, authService, csvExportService, cycleService, libraryService, offeringService, productService, siteLicensePricesCsvData, vendorDataService, vendorStatusService) {
    var vm = this;

    vm.changedOfferings = [];
    vm.loadingPromise = null;
    vm.newOfferings = [];
    vm.products = [];
    vm.viewOptions = {};
    vm.selectedProductIds = {};
    vm.selectedLibraryIds = {};

    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.quickPricingCallback = quickPricingCallback;
    vm.saveOfferings = saveOfferings;
    vm.downloadCsv = downloadCsvDataForExistingPricing;
    vm.downloadComparisonCsv = downloadCsvDataForComparisonPricing;
    vm.checkViewOption = checkViewOption;
    vm.isCommentModeEnabled = false;
    vm.showHistoricalPricing = showHistoricalPricing;
    vm.toggleCommentMode = function () {
        vm.isCommentModeEnabled = !vm.isCommentModeEnabled;
    };

    activate();

    function activate() {
        affixControlsToTopOfPage();

        vm.cycle = cycleService.getCurrentCycle();
        vm.isOneTimePurchase = (vm.cycle.cycleType === 'One-Time Purchase');
        vm.user = authService.getCurrentUser();
        vm.vendor = vm.user.vendor;
        vm.vendorId = vm.vendor.id;

        vm.viewOptions = {
            size: true,
            type: true,
            years: true,
            priceCap: true
        };

        vm.loadingPromise = loadLibraries()
            .then(initializePricingGrid);

        $scope.$on("$destroy", onControllerDestroy);
    }

    function affixControlsToTopOfPage() {
        var headerPinnedEvent = 'affixed.bs.affix';
        var headerUnpinnedEvent = 'affixed-top.bs.affix';

        var heightOfSiteHeader = 165;
        var heightOfPageHeader = 105;

        $('.page-header').affix({offset: {top: heightOfSiteHeader}});

        $(document).on(headerPinnedEvent, headerPinned);
        $(document).on(headerUnpinnedEvent, headerUnpinned);

        function headerPinned(e) {
            $('main > div[role="application"]').css('padding-top', heightOfPageHeader + 'px');
        }

        function headerUnpinned(e) {
            $('main > div[role="application"]').css('padding-top', '0');
        }
    }

    function initializePricingGrid() {
        vm.products = [];

        resetSelectedLibrariesAndProducts();

        return loadProducts()
            .then(buildPriceArray)
            .then(buildPricingGrid);
    }

    function loadLibraries() {
        return libraryService.listActiveLibraries().then(function (libraries) {
            vm.libraries = libraries.sort(byName);
            initializeSelectedLibraryIds();
        });
    }

    function loadProducts() {
        return productService.listProductsWithOfferingsForVendorId(authService.getCurrentUser().vendor.id).then(function (products) {
            vm.products = products.sort(byName);
            initializeSelectedProductIds();
        });
    }

    function resetSelectedLibrariesAndProducts() {
        selectAllLibraries();
        selectAllProducts();
    }

    function byName(entity1, entity2) {
        var a = entity1.name.toLowerCase();
        var b = entity2.name.toLowerCase();
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    }

    function selectAllLibraries() {
        vm.libraries.forEach(function (library) {
            vm.selectedLibraryIds[library.id] = true;
        });
    }

    function initializeSelectedLibraryIds() {
        selectAllLibraries();
        $scope.$watchCollection(getSelectedLibraryIds, updateVisibilityOfRowsForSelectedLibraries);
        function getSelectedLibraryIds() {
            return vm.selectedLibraryIds;
        }
    }

    function selectAllProducts() {
        vm.products.forEach(function (product) {
            vm.selectedProductIds[product.id] = true;
        });
    }

    function initializeSelectedProductIds() {
        selectAllProducts();
        $scope.$watchCollection(getSelectedProductIds, updateVisibilityOfCellsForSelectedProducts);
        function getSelectedProductIds() {
            return vm.selectedProductIds;
        }
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
        //console.time('buildPricingGrid');
        disableUnsavedChangesWarning();
        vm.changedOfferings = [];
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
        $('.offering-row').remove();

        vm.libraries.forEach(function (library) {
            var row = generateLibraryRow(library);
            vm.products.forEach(function (product) {
                row.append(generateOfferingCell(library, product));
            });
            $('#site-pricing-grid').append(row);
        });

        attachGridCellEvents();

        //console.timeEnd('buildPricingGrid');

        function generateLibraryRow(library) {
            var row = $('<div class="price-row offering-row">');
            row.addClass('' + library.id);
            return row;
        }

        function generateOfferingCell(library, product) {
            var offering = offeringForProductAndLibrary(product.id, library.id);
            var textForPrice = '';
            if (offering && offering.pricing) {
                textForPrice = offering.pricing.site;
            }

            var cellContents = createReadOnlyOfferingCell(textForPrice);

            var offeringCell = $('<div class="column offering">')
                .addClass(product.id)
                .append(cellContents)
                .data('libraryId', library.id)
                .data('fte', library.fte)
                .data('productId', product.id);

            applyCssClassesToOfferingCell(offeringCell, offering);

            if (offering && offering.vendorComments && offering.vendorComments.site) {
                cellContents.find('.comment-marker').show();
            }

            return offeringCell;
        }
    }

    function attachGridCellEvents() {
        removeGridCellEvents();
        $('body')
            .on('blur', '.price-editable', applyPricingChangesToCell)
            .on('focus', '.comment-marker', editCommentMarker)
            .on('focus', '.price', editCell);
    }

    function removeGridCellEvents() {
        $('body').off();
    }

    function showCommentModalFor(offering, cell) {
        offering.vendorComments = offering.vendorComments || {};
        offering.vendorComments.site = offering.vendorComments.site || '';

        vm.modalCommentText = offering.vendorComments.site;

        vm.saveModalComment = function () {
            offering.vendorComments.site = vm.modalCommentText;

            return offeringService.update(offering)
                .then(offeringService.load)
                .then(updateRevision)
                .then(updateCommentMarker)
                .then(syncData)
                .catch(syncDataError);

            function updateRevision(updatedOffering) {
                offering._rev = updatedOffering._rev;
                return updatedOffering;
            }

            function updateCommentMarker(passthrough) {
                setCommentMarkerVisibility(cell);
                return passthrough;
            }
        };

        $('#vendor-comment-modal').modal();
    }

    function createReadOnlyOfferingCell(price) {
        if (typeof price !== 'undefined' && price !== null && typeof price.toFixed === 'function') {
            price = price.toFixed(2);
        }
        var cell = $('<div tabindex="0" class="price" role="gridcell"></div>').text(price);

        var commentMarker = $('<div tabindex="0" class="comment-marker fa fa-comment-o" style="display: none;"></div>');
        cell.append(commentMarker);

        return cell;
    }

    function editCell(e) {
        var clickAction = vm.isCommentModeEnabled ? editCellComment : editCellPrice;
        clickAction(this);
    }

    function editCellComment(element) {
        var $el = $(element);
        var libraryId = $el.parent().data('libraryId');
        var productId = $el.parent().data('productId');
        var offering = vm.offeringsForLibraryByProduct[productId][libraryId];

        showCommentModalFor(offering, $el);
        $scope.$apply(function () {
            vm.isCommentModeEnabled = false;
        });
    }

    function editCellPrice(element) {
        var $this = $(element);
        var price = $this.text();
        var $offeringCell = $this.parent();
        var libraryId = $offeringCell.data('libraryId');
        var productId = $offeringCell.data('productId');
        var input = createEditableOfferingCell(price, libraryId, productId);
        $this.replaceWith(input);
        input.focus().select();
    }

    function editCommentMarker(e) {
        var $marker = $(this);
        var $cell = $marker.parent();
        var libraryId = $cell.parent().data('libraryId');
        var productId = $cell.parent().data('productId');
        var offering = vm.offeringsForLibraryByProduct[productId][libraryId];

        $scope.$apply(function () {
            showCommentModalFor(offering, $cell);
        });
    }

    function setCommentMarkerVisibility(cell) {
        var offering = getOfferingForCellContents(cell);
        var commentMarker = cell.find('.comment-marker');

        if (offering && offering.vendorComments && offering.vendorComments.site) {
            commentMarker.show();
        } else {
            commentMarker.hide();
        }
    }

    function offeringForProductAndLibrary(productId, libraryId) {
        if (vm.offeringsForLibraryByProduct[productId] && vm.offeringsForLibraryByProduct[productId][libraryId]) {
            return vm.offeringsForLibraryByProduct[productId][libraryId];
        }
        return null;
    }

    function getOfferingForCellContents(cellContents) {
        return getOfferingForCell(cellContents.parent());
    }

    function getOfferingForCell(offeringCell) {
        var productId = offeringCell.data('productId');
        var libraryId = offeringCell.data('libraryId');
        return offeringForProductAndLibrary(productId, libraryId);
    }

    function applyNewCellPricingToOffering(offeringCell, offering, newPriceValue) {
        var newPrice = parseFloat(newPriceValue);

        if (isNaN(newPrice)) {
            return;
        }

        if (!offering) {
            if (newPrice !== null) {
                //Logger.log('no offering, add new one with price ', newPrice);
                var productId = offeringCell.data('productId');
                var libraryId = offeringCell.data('libraryId');

                if (!libraryId || !productId) {
                    console.log('problem in applyNewCellPricingToOffering for library ' + libraryId + ' product ' + productId);
                    console.log('  library:', libraryId);
                    console.log('  product:', productId);
                    console.log('  offering:', offering);
                    console.log('  cell:', offeringCell);
                }

                offering = generateNewOffering(libraryId, productId, newPrice);
                vm.newOfferings.push(offering);
            }
        }
        else if (newPrice !== null && newPrice != offering.pricing.site) {
            //Logger.log('set offering price to '+newPrice+' (was '+offering.pricing.site+')');
            offering.pricing.site = newPrice;
            offering.display = 'with-price';
            markOfferingUpdated(offering);
        }
    }

    function markOfferingUpdated(offering) {
        if ( offering ) {
            offering.siteLicensePriceUpdated = new Date().toISOString();
            vm.changedOfferings.push(offering);
            enableUnsavedChangesWarning();
        }
    }

    function applyCssClassesToOfferingCell(offeringCell, offering) {
        if (offering) {
            delete offering.flaggedReason;
        }
        else {
            return;
        }

        setOfferingUpdatedState();
        setOfferingFlaggedState();

        function setOfferingUpdatedState() {
            if (offering.siteLicensePriceUpdated) {
                offeringCell.addClass('updated');
            }
            else {
                offeringCell.removeClass('updated');
            }
        }

        function setOfferingFlaggedState() {
            var offeringIsFlagged = offeringService.getFlaggedState(offering, vm.cycle);

            var offeringReasonsApplicableToSiteLicensePricing = [];
            if (offering.flaggedReason) {
                offeringReasonsApplicableToSiteLicensePricing = offering.flaggedReason.filter(applicableFlagReason);
            }

            if (vendorHasUpdatedTheOfferingsPricing() && offeringIsFlagged && flagsAreNotExclusivelyAboutSuPrices()) {
                if (window.debug) {
                    console.log('flag offering', offering, vm.cycle);
                }
                addFlagDisplay();
            }
            else {
                removeFlagDisplay();
            }

            function vendorHasUpdatedTheOfferingsPricing() {
                return offering.siteLicensePriceUpdated;
            }

            function flagsAreNotExclusivelyAboutSuPrices() {
                return offeringReasonsApplicableToSiteLicensePricing.length > 0;
            }

            function addFlagDisplay() {
                offeringCell.addClass('flagged');
                offeringCell.attr('title', offeringReasonsApplicableToSiteLicensePricing[0]);
            }

            function removeFlagDisplay() {
                offeringCell.removeClass('flagged');
                offeringCell.attr('title', '');
            }

            function applicableFlagReason(reason) {
                return reason.indexOf('One or more SU prices') < 0 && reason.indexOf('SU prices must') < 0;
            }
        }
    }

    function createEditableOfferingCell(price, libraryId, productId) {
        var library = getLibraryById(libraryId);
        var product = getProductById(productId);
        if (!library || !product) {
            console.log('problem in createEditableOfferingCell for library ' + libraryId + ' product ' + productId);
            console.log('  library:', library);
            console.log('  product:', product);
        }
        var labelText = 'site license price for library ' + library.name + ' for product ' + product.name;
        return $('<input class="price-editable" role="textbox" type="text" step=".01" min="0">')
            .attr('aria-label', labelText)
            .val(price);
    }

    function applyPricingChangesToCell(e) {
        var $this = $(this);
        var offeringCell = $this.parent();
        var offering = getOfferingForCell(offeringCell);

        applyNewCellPricingToOffering(offeringCell, offering, $this.val());

        applyCssClassesToOfferingCell(offeringCell, offering);

        var textForOfferingPrice = '';
        if (offering && offering.pricing) {
            textForOfferingPrice = offering.pricing.site;
        }

        var newReadOnlyCellContents = createReadOnlyOfferingCell(textForOfferingPrice);
        $this.replaceWith(newReadOnlyCellContents);
        setCommentMarkerVisibility(newReadOnlyCellContents);
    }

    function generateNewOffering(libraryId, productId, newPrice) {
        return {
            cycle: vm.cycle,
            library: libraryId.toString(),
            product: productId,
            pricing: {
                site: newPrice
            },
            siteLicensePriceUpdated: new Date().toISOString()
        };
    }

    function saveOfferings() {
        vm.loadingPromise = vendorDataService.isVendorAllowedToMakeChangesToCycle(vm.user, vm.cycle)
            .then(function (vendorIsAllowedToSavePrices) {
                if (vendorIsAllowedToSavePrices) {
                    return saveAllOfferings(vm.newOfferings, vm.changedOfferings);
                }
                else {
                    alertService.putAlert('Pricing for the current cycle has been closed. Please contact CARLI staff for more information.', {severity: 'danger'});
                    return false;
                }
            });
        return vm.loadingPromise;
    }

    function saveAllNewOfferings(newOfferings) {
        return $q.all(newOfferings.map(offeringService.create));
    }

    function saveAllChangedOfferings(changedOfferings) {
        changedOfferings = changedOfferings.map(clearManualFlagOverrides);
        return offeringService.bulkUpdateOfferings(changedOfferings, vm.cycle);

        function clearManualFlagOverrides(offering) {
            delete offering.flagged;
            return offering;
        }
    }

    function saveAllOfferings(newOfferings, changedOfferings) {
        return $q.all([
            saveAllNewOfferings(newOfferings),
            saveAllChangedOfferings(changedOfferings)
        ])
            .then(function (arrays) {
                var newOfferingsCreated = arrays[0].length;
                var oldOfferingsUpdated = arrays[1].length;
                var count = newOfferingsCreated + oldOfferingsUpdated;

                Logger.log('created ' + newOfferingsCreated + ' new offerings');
                Logger.log('updated ' + oldOfferingsUpdated + ' old offerings');

                vm.newOfferings = [];
                vm.changedOfferings = [];
                disableUnsavedChangesWarning();

                if (count) {
                    return initializePricingGrid();
                }
                else {
                    return $q.when();
                }
            })
            .catch(function (err) {
                Logger.log('error saving offerings', err);
            })
            .then(updateVendorFlaggedOfferings)
            .then(updateVendorStatus)
            .then(syncData)
            .catch(syncDataError);

        function updateVendorStatus() {
            return vendorStatusService.updateVendorStatusActivity('Site License Prices Updated', vm.vendorId, vm.cycle);
        }

        function updateVendorFlaggedOfferings() {
            return vendorStatusService.updateVendorStatusFlaggedOfferings(vm.vendorId, vm.cycle);
        }
    }

    function syncData() {
        return cycleService.syncDataBackToCarli();
    }

    function syncDataError(err) {
        Logger.log('error syncing data', err);
    }

    function quickPricingCallback(mode, quickPricingValue, allQuickPricingArguments) {
        var selectedLibraryIds = Object.keys(vm.selectedLibraryIds).filter(function (libraryId) {
            return vm.selectedLibraryIds[libraryId];
        });
        var selectedProductIds = Object.keys(vm.selectedProductIds).filter(function (productId) {
            return vm.selectedProductIds[productId];
        });

        var shouldApplyBulkPricingComment = allQuickPricingArguments.addComment;

        $('#site-pricing-grid .offering').each(function (i, cell) {
            var newValue = null;
            var $offeringCell = $(cell);

            var libraryId = $offeringCell.data('libraryId');
            var productId = $offeringCell.data('productId');
            var offering = offeringForProductAndLibrary(productId, libraryId);

            if (cellShouldBeUpdated(libraryId, productId)) {
                if (mode == 'dollarAmount') {
                    newValue = quickPricingValue;
                }
                else if (mode == 'percentageIncrease') {
                    var originalValue = parseFloat($offeringCell.text());
                    if (isNaN(originalValue)) {
                        return;
                    }
                    newValue = (100 + quickPricingValue) / 100 * originalValue;
                    var newValueRoundedDown = Math.floor(newValue * 100) / 100;
                    newValue = newValueRoundedDown;
                }
                else if (mode == 'byFte') {
                    var fte = $offeringCell.data('fte');
                    newValue = quickPricingValue * fte;
                }
                else if (mode == 'deletePricing') {
                    newValue = null;
                    offering = offeringService.removeSitePricing(offering);
                }
                updateCellContents($offeringCell, offering, newValue);
            }
        });

        function cellShouldBeUpdated(libraryId, productId) {
            return selectedLibraryIds.indexOf(libraryId) != -1 && selectedProductIds.indexOf(productId) != -1;
        }

        function applyBulkPricingComment(offering) {
            if (offering && shouldApplyBulkPricingComment) {
                offering.vendorComments = offering.vendorComments || {};
                offering.vendorComments.site = allQuickPricingArguments.bulkComment;
            }
        }

        function updateCellContents(offeringCell, offering, value) {
            applyBulkPricingComment(offering);
            applyNewCellPricingToOffering(offeringCell, offering, value);
            markOfferingUpdated(offering);

            applyCssClassesToOfferingCell(offeringCell, offering);

            var newReadOnlyCellContents = createReadOnlyOfferingCell( findSitePrice(offering) );
            offeringCell.find('.price').replaceWith(newReadOnlyCellContents);
            setCommentMarkerVisibility(newReadOnlyCellContents);

            function findSitePrice(offering) {
                if ( offering ) {
                    return offering.pricing ? offering.pricing.site : '';
                }
                return '';
            }
        }
    }

    function downloadCsvDataForExistingPricing() {
        vm.loadingPromise = generateCsvData()
            .then(csvExportService.exportToCsv)
            .then(function (csvContent) {
                csvExportService.browserDownloadCsv(csvContent, makeFilename());
            })
            .catch(function (err) {
                Logger.log('CSV generation failed', err);
            });

        return vm.loadingPromise;

        function generateCsvData() {
            return siteLicensePricesCsvData.generateSiteLicensePriceCsv(vm.viewOptions, getCsvProductList(), getCsvLibraryList(), vm.offeringsForLibraryByProduct);

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

        function makeFilename() {
            var vendorName = authService.getCurrentUser().vendor.name;
            var cycleName = cycleService.getCurrentCycle().name;
            return vendorName + ' ' + cycleName + ' Site License Prices.csv';
        }
    }

    function downloadCsvDataForComparisonPricing() {
        vm.loadingPromise = generateCsvData()
            .then(function (results) {
                return csvExportService.exportToCsv(results);
            })
            .then(function (csvContent) {
                csvExportService.browserDownloadCsv(csvContent, makeFilename());
            })
            .catch(function (err) {
                Logger.log('CSV generation failed', err);
            });

        return vm.loadingPromise;

        function generateCsvData() {
            return siteLicensePricesCsvData.generateSiteLicensePriceCsvIncludingLastYear(vm.viewOptions, getCsvProductList(), getCsvLibraryList(), vm.offeringsForLibraryByProduct, vm.cycle.year);

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

        function makeFilename() {
            var vendorName = authService.getCurrentUser().vendor.name;
            var cycleName = cycleService.getCurrentCycle().name;
            return vendorName + ' ' + cycleName + ' Site License Prices Comparison with Last Year.csv';
        }
    }

    function checkViewOption(option) {
        vm.viewOptions[option] = !vm.viewOptions[option];
    }

    function showHistoricalPricing() {
        $('#historic-pricing-modal').modal().one('hide.bs.modal', killModalContentWhenModalHides);
        vm.historicPopupShowing = true;

        //not strictly necessary since the main concern is not building the historic grid at page load
        function killModalContentWhenModalHides(event) {
            $scope.$apply(function () {
                vm.historicPopupShowing = false;
            });
        }
    }

    function getLibraryById(libraryId) {
        return vm.libraries.filter(function (library) {
            return library.id === libraryId;
        })[0];
    }

    function getProductById(productId) {
        return vm.products.filter(function (product) {
            return product.id === productId;
        })[0];
    }

    function onControllerDestroy(e) {
        removeGridCellEvents();
    }

    function enableUnsavedChangesWarning() {
        $scope.warningForm.$setDirty();
    }

    function disableUnsavedChangesWarning() {
        $scope.warningForm.$setPristine();
    }
}

angular.module('vendor.sections.simultaneousUserPrices')
    .controller('simultaneousUserPricesController', simultaneousUserPricesController);

function simultaneousUserPricesController($scope, $q, $filter, activityLogService, alertService, authService, csvExportService, cycleService, offeringService, productService, simultaneousUserPricesCsvData, vendorDataService, vendorStatusService) {
    var vm = this;
    vm.changedProductIds = {};
    vm.loadingPromise = null;
    vm.productsSaved = 0;
    vm.productsSavedProgress = 0;

    vm.bulkCommentsTemporaryStorage = {};
    vm.selectedProductIds = {};
    vm.selectedSuLevelIds = {};
    vm.suPricingByProduct = {};
    vm.suCommentsByProduct = {};
    vm.suLevels = [];
    vm.totalProducts = 0;
    vm.updatesByProductId = {};

    vm.downloadCsv = downloadCsv;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.addSuPricingLevel = addSuPricingLevel;
    vm.nextSuLevel = nextSuLevel;
    vm.saveOfferings = saveOfferings;
    vm.quickPricingCallback = quickPricingCallback;
    vm.isCommentModeEnabled = false;
    vm.toggleCommentMode = function () {
        vm.isCommentModeEnabled = !vm.isCommentModeEnabled;
    };
    vm.csvExportIsDisabled = csvExportIsDisabled;
    vm.thereAreUnsavedChanges = thereAreUnsavedChanges;

    activate();

    function activate() {
        vm.cycle = cycleService.getCurrentCycle();
        vm.user = authService.getCurrentUser();
        vm.vendor = vm.user.vendor;
        vm.vendorId = vm.vendor.id;

        vm.loadingPromise = loadProducts()
            .then(getSuPricingForAllProducts)
            .then(initializeSuLevelsFromPricing)
            .then(initializeSelectedProductIds)
            .then(initializeSelectedSuLevelIds)
            .then(buildPricingGrid);
    }

    function loadProducts() {
        return productService.listActiveProductsForVendorId(vm.vendorId).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
            return products;
        });
    }

    function getSuPricingForAllProducts(productList) {
        return $q.all(productList.map(loadSuLevelsForProduct));

        function loadSuLevelsForProduct(product) {
            return offeringService.getOneOfferingForProductId(product.id).then(function (offering) {
                var representativeOffering = offering || {};
                var pricingForProduct = representativeOffering.pricing || {};
                var suPricingForProduct = pricingForProduct.su || [];
                var vendorComments = representativeOffering.vendorComments || {};
                var suComments = vendorComments.su || [];

                vm.suPricingByProduct[product.id] = convertArrayOfPricingObjectsToMappingObject(suPricingForProduct);
                vm.suCommentsByProduct[product.id] = convertCommentsToMappingObject(suComments);
                vm.updatesByProductId[product.id] = representativeOffering.suPricesUpdated;

                return vm.suPricingByProduct[product.id];
            });

            function convertArrayOfPricingObjectsToMappingObject(suPricing) {
                var suPricingMap = {};
                suPricing.forEach(function (suPricingObject) {
                    suPricingMap[suPricingObject.users] = suPricingObject.price;
                });
                return suPricingMap;
            }

            function convertCommentsToMappingObject(comments) {
                var commentsMap = {};
                comments.forEach(function (suComment) {
                    commentsMap[suComment.users] = suComment.comment;
                });
                return commentsMap;
            }
        }
    }

    function initializeSuLevelsFromPricing() {
        var combinedSuLevels = {};

        vm.products.forEach(function (product) {
            var pricingObject = vm.suPricingByProduct[product.id];
            Object.keys(pricingObject).forEach(function (suLevel) {
                combinedSuLevels[suLevel] = true;
            });
        });

        vm.suLevels = Object.keys(combinedSuLevels).map(makeSuLevel);

        if (vm.suLevels.length === 0) {
            vm.suLevels = [1, 2, 3].map(makeSuLevel);
        }
    }

    function makeSuLevel(level) {
        return {
            id: 'su-' + level,
            name: suLevelName(level),
            shortName: suLevelShortName(level),
            users: level - 0
        };

        function suLevelName(level) {
            return level + ' Simultaneous User' + (level > 1 ? 's' : '');
        }

        function suLevelShortName(level) {
            return level + ' S.U.';
        }
    }

    function initializeSelectedProductIds() {
        vm.products.forEach(function (product) {
            vm.selectedProductIds[product.id] = true;
        });
        $scope.$watchCollection(getSelectedProductIds, updateVisibilityOfCellsForSelectedProducts);
        function getSelectedProductIds() {
            return vm.selectedProductIds;
        }
    }

    function initializeSelectedSuLevelIds() {
        vm.suLevels.forEach(function (su) {
            vm.selectedSuLevelIds[su.id] = true;
        });
        $scope.$watchCollection(getSelectedSuLevelIds, updateVisibilityOfRowsForSelectedSuLevels);
        function getSelectedSuLevelIds() {
            return vm.selectedSuLevelIds;
        }
    }

    function updateVisibilityOfRowsForSelectedSuLevels(selectedEntities) {
        if (selectedEntities) {
            Object.keys(selectedEntities).forEach(function (entityId) {
                var displayValue = selectedEntities[entityId] ? 'table-row' : 'none';
                $('.' + entityId).css('display', displayValue);
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

    function updateCellVisibility() {
        updateVisibilityOfRowsForSelectedSuLevels(vm.selectedSuLevelIds);
        updateVisibilityOfCellsForSelectedProducts(vm.selectedProductIds);
    }

    function buildPricingGrid() {
        vm.suLevels.forEach(function (level) {
            makeSuPricingRow(level);
        });

        vm.products.forEach(function (product) {
            updateFlaggedStatusForProduct(product.id);
        });
    }

    function makeSuPricingRow(level) {
        var newRowUsers = level.users;
        var $row = $('<div class="price-row">')
            .addClass('su-' + newRowUsers)
            .data('su', newRowUsers);

        vm.products.forEach(function (product) {
            $row.append(generateOfferingCell(level, product));
        });

        var stillNeedToInsertRow = true;

        $('#su-pricing-grid > .price-row').each(function (index) {
            var $currentRow = $(this);
            var currentRowUsers = $currentRow.data('su') || 0;
            if (shouldInsertNewRowBeforeCurrentRow()) {
                $currentRow.before($row);
                stillNeedToInsertRow = false;
                return false;
            }

            function shouldInsertNewRowBeforeCurrentRow() {
                return currentRowUsers > newRowUsers;
            }
        });

        if (stillNeedToInsertRow) {
            $('#su-pricing-grid').append($row);
        }

        updateCellVisibility();

        return $row;

        function generateOfferingCell(suLevel, product) {
            var priceForProduct = vm.suPricingByProduct[product.id][suLevel.users];
            var offeringWrapper = $('<div class="column offering input">');
            var offeringCellContent = createOfferingCellContent(priceForProduct);

            if (offeringCellContent.hasClass('no-pricing')) {
                offeringCellContent.attr('aria-label', 'Enter pricing for ' + suLevel.users + ' simultaneous users for ' + product.name);
            }

            var offeringCell = offeringWrapper.append(offeringCellContent);

            offeringWrapper.on('click', function () {
                $(this).children().first().focus();
            });

            offeringCell.data('numSu', suLevel.users);
            offeringCell.data('productId', product.id);
            offeringCell.addClass(product.id);

            if (vm.updatesByProductId[product.id]) {
                offeringCell.addClass('updated');
            }

            setCommentMarkerVisibility(offeringCell);

            return offeringCell;
        }
    }

    function showCommentModalFor(cell) {
        var productId = $(cell).parent().data('productId');
        var numSu = $(cell).parent().data('numSu');

        vm.modalCommentText = vm.suCommentsByProduct[productId][numSu] || '';

        vm.saveModalComment = function (newCommentText) {
            return offeringService
                .updateSuCommentForAllLibrariesForProduct(vm.vendorId, productId, numSu, newCommentText)
                .then(updateMap)
                .then(updateCommentMarker)
                .then(syncData);

            function updateMap(passthrough) {
                vm.suCommentsByProduct[productId][numSu] = newCommentText;
                return passthrough;
            }
        };

        function updateCommentMarker(passthrough) {
            setCommentMarkerVisibility($(cell).parent());
            return passthrough;
        }

        $('#vendor-comment-modal').modal();
    }

    function createOfferingCellContent(price) {
        if (price > 0 || price === 0) {
            return createReadOnlyOfferingCell(price);
        }
        else {
            return createEmptyOfferingCell();
        }
    }

    function createReadOnlyOfferingCell(price) {
        if (typeof price !== 'undefined' && price !== null && typeof price.toFixed === 'function') {
            price = price.toFixed(2);
        }
        var cell = $('<div tabindex="0" class="price" role="gridcell"></div>').text(price);
        cell.on('focus', onReadOnlyClick);
        addCommentMarkerTo(cell);

        return cell;
    }

    function createEmptyOfferingCell() {
        var cell = $('<div tabindex="0" class="price no-pricing" role="gridcell">&nbsp;</div>');
        cell.on('focus', onReadOnlyClick);
        addCommentMarkerTo(cell);

        return cell;
    }

    function createEditableOfferingCell(price, numSu, productId) {
        var product = getProductById(productId);
        var labelText = 'price for ' + numSu + ' users for product ' + product.name;

        var cell = $('<input class="price-editable" role="textbox" type="text" step=".01" min="0">')
            .attr('aria-label', labelText)
            .val(price)
            .data('oldPrice', price)
            .on('blur', makeReadOnly);
        return cell;
    }

    function onReadOnlyClick() {
        var clickAction = vm.isCommentModeEnabled ? editComment : makeEditable;
        clickAction(this);
    }

    function makeEditable(cell) {
        var $cell = $(cell);
        var price = $cell.text();

        var offeringCell = $cell.parent();
        var productId = offeringCell.data('productId');
        var numSu = offeringCell.data('numSu');

        var input = createEditableOfferingCell(price, numSu, productId);
        $cell.replaceWith(input);
        input.focus().select();
    }

    function makeReadOnly() {
        var $cell = $(this);
        var offeringCell = $cell.parent();
        var productId = offeringCell.data('productId');

        var oldPrice = $cell.data('oldPrice');
        var newPrice = $cell.val();
        var priceAsNumber = parseFloat($cell.val());

        if ( oldPrice !== newPrice ) {
            $scope.$apply(function() {
                markProductChangedForCell(offeringCell);
            });
        }

        var div = createOfferingCellContent(priceAsNumber);

        $cell.replaceWith(div);
        setCommentMarkerVisibility(div);
        updateFlaggedStatusForProduct(productId);
    }

    function editComment(cell) {
        showCommentModalFor(cell);
        $scope.$apply(function () {
            vm.isCommentModeEnabled = false;
        });
    }

    function addCommentMarkerTo(cell) {
        var commentMarker = $('<div tabindex="0" class="comment-marker fa fa-comment-o"></div>');
        commentMarker.on('focus', editExistingComment);
        cell.append(commentMarker);

        commentMarker.hide();

        return commentMarker;

        function editExistingComment() {
            $scope.$apply(function () {
                showCommentModalFor(cell);
            });
        }
    }

    function setCommentMarkerVisibility(cell) {
        $cell = $(cell);
        var productId = $cell.data('productId') || $cell.parent().data('productId');
        var numSu = $cell.data('numSu') || $cell.parent().data('numSu');
        var commentMarker = $cell.find('.comment-marker');

        var suComments = vm.suCommentsByProduct[productId] || {};
        var commentText = suComments[numSu] || '';

        if (commentText && !commentMarker.length) {
            commentMarker = addCommentMarkerTo($cell);
        }

        if (commentText) {
            commentMarker.show();
        } else {
            commentMarker.hide();
        }
    }

    function markProductChangedForCell(jqueryCell) {
        var productId = jqueryCell.data('productId');
        markProductChanged(productId);
    }

    function getSuPricingFromFormForProduct(productId) {
        var result = [];

        vm.suLevels.forEach(function (suLevel) {
            var users = suLevel.users;
            var $productCellForSu = $('.price-row.su-' + users + ' .' + productId);
            var newPrice = parseFloat($productCellForSu.text());

            if (!isNaN(newPrice)) {
                result.push({
                    users: users,
                    price: newPrice
                });
            }
        });

        return result;
    }

    function saveOfferings() {
        var newSuPricingByProduct = {};

        vm.products.forEach(function (product) {
            newSuPricingByProduct[product.id] = getSuPricingFromFormForProduct(product.id);
        });

        var productIdsToUpdate = Object.keys(vm.changedProductIds).filter(function (id) {
            return vm.changedProductIds[id];
        });

        vm.loadingPromise = vendorDataService.isVendorAllowedToMakeChangesToCycle(vm.user, vm.cycle)
            .then(function (vendorIsAllowedToSavePrices) {
                if (!vendorIsAllowedToSavePrices) {
                    alertService.putAlert('Pricing for the current cycle has been closed. Please contact CARLI staff for more information.', {severity: 'danger'});
                    return false;
                }
                else if (productIdsToUpdate.length < 4) {
                    return updateChangedProductsConcurrently();
                }
                else {
                    return updateChangedProductsSeriallyWithProgressBar();
                }
            })
            .then(clearTemporaryBulkCommentsStorage)
            .then(saveProductsSuccess)
            .catch(saveProductsError);

        return vm.loadingPromise;

        function updateChangedProductsConcurrently() {
            return $q.all(productIdsToUpdate.map(updateOfferingsForAllLibrariesForProduct))
                .then(updateVendorFlaggedOfferings)
                .then(updateVendorStatus)
                .then(syncData)
                .then(function () {
                    vm.changedProductIds = {};
                    disableUnsavedChangesWarning();
                    Logger.log('saved ' + productIdsToUpdate.length + ' products');
                })
                .catch(function (err) {
                    console.error(err);
                });
        }

        function updateChangedProductsSeriallyWithProgressBar() {
            var saveAllProductsPromise = $q.defer();

            vm.productsSaved = 0;
            vm.productsSavedProgress = 0;
            vm.totalProducts = productIdsToUpdate.length;

            $('#progress-modal').modal({
                backdrop: 'static',
                keyboard: false
            });

            enableUnsavedChangesWarning();

            saveNextProduct();

            function saveNextProduct() {
                if (vm.productsSaved === vm.totalProducts) {
                    serialSaveFinished();
                    return;
                }

                return updateOfferingsForAllLibrariesForProduct(productIdsToUpdate[vm.productsSaved])
                    .then(function () {
                        vm.productsSaved++;
                        vm.productsSavedProgress = Math.floor((vm.productsSaved / vm.totalProducts) * 100);
                        saveNextProduct();
                    })
                    .catch(function (err) {
                        hideSaveDialog();
                        saveAllProductsPromise.reject(err);
                    });
            }

            return saveAllProductsPromise.promise;


            function serialSaveFinished() {
                return updateVendorFlaggedOfferings()
                    .then(updateVendorStatus)
                    .then(syncData) //Enhancement: get couch replication job progress, show it in the 2nd progress bar
                    .finally(function () {
                        hideSaveDialog();
                        saveAllProductsPromise.resolve();
                    });
            }

            function hideSaveDialog() {
                $('#progress-modal').modal('hide');
                disableUnsavedChangesWarning();
            }
        }

        function updateOfferingsForAllLibrariesForProduct(productId) {
            var newSuPricing = newSuPricingByProduct[productId];
            return offeringService
                .updateSuPricingForAllLibrariesForProduct(vm.vendorId, productId, newSuPricing, vm.bulkCommentsTemporaryStorage[productId])
                .then(logSuPriceUpdate);
        }

        function logSuPriceUpdate(savedIds) {
            return savedIds.map(function(savedId) {
                Logger.log('logSuPriceUpdate: ', savedId, vm.products);
                //activityLogService.logVendorChangeSUPrice(vm.cycle, vm.vendor);
            });
        }

        function updateVendorStatus() {
            return vendorStatusService.updateVendorStatusActivity('Simultaneous User Prices Updated', vm.vendorId, vm.cycle);
        }

        function updateVendorFlaggedOfferings() {
            return vendorStatusService.updateVendorStatusFlaggedOfferings(vm.vendorId, vm.cycle);
        }

        function clearTemporaryBulkCommentsStorage() {
            vm.bulkCommentsTemporaryStorage = {};
        }

        function saveProductsSuccess() {
            alertService.putAlert('Pricing saved.', {severity: 'success'});
        }

        function saveProductsError(err) {
            alertService.putAlert('There was a problem saving your changes. Please contact CARLI staff for more information.', {severity: 'danger'});
        }
    }

    function syncData() {
        return cycleService.syncDataBackToCarli();
    }

    function addSuPricingLevel(numberOfUsers) {
        var newLevel = makeSuLevel(numberOfUsers);

        if (suLevelExists()) {
            return;
        }

        vm.suLevels.push(newLevel);
        vm.selectedSuLevelIds[newLevel.id] = true;

        makeSuPricingRow(newLevel);


        function suLevelExists() {
            return vm.suLevels.filter(function (suLevel) {
                return suLevel.users === numberOfUsers;
            }).length;
        }
    }

    function quickPricingCallback(mode, pricingBySuLevel, allQuickPricingArguments) {
        var selectedSuLevels = vm.suLevels.filter(function (suLevel) {
            return vm.selectedSuLevelIds[suLevel.id];
        });

        if (mode === 'dollarAmount') {
            var suLevelPricesToInsert = selectedSuLevels.map(function (suLevel) {
                return {
                    users: suLevel.users,
                    price: pricingBySuLevel[suLevel.users]
                };
            });

            suLevelPricesToInsert.forEach(applySuPricingToSelectedProducts);
        }
        else {
            var suLevelPercentagesToApply = selectedSuLevels.map(function (suLevel) {
                return {
                    users: suLevel.users,
                    percent: pricingBySuLevel[suLevel.users]
                };
            });

            suLevelPercentagesToApply.forEach(applySuPercentageIncreaseToSelectedProducts);
        }

        if (allQuickPricingArguments.addComment) {
            storeBulkCommentsUntilUserSaves();
        }

        function storeBulkCommentsUntilUserSaves() {
            vm.bulkCommentsTemporaryStorage = vm.bulkCommentsTemporaryStorage || {};

            var commentsArray = commentsBySuLevelArray();
            var commentsMap = commentsBySuLevelMap();

            selectedProductIds().forEach(saveCommentForSelectedProduct);
            updateCommentMarkers();

            function saveCommentForSelectedProduct(productId) {
                vm.bulkCommentsTemporaryStorage[productId] = commentsArray;
                vm.suCommentsByProduct[productId] = commentsMap;
                markProductChanged(productId);
            }

            function commentsBySuLevelArray() {
                return selectedSuLevels.map(function (suLevel) {
                    return {
                        users: suLevel.users,
                        comment: allQuickPricingArguments.bulkComment
                    };
                });
            }

            function commentsBySuLevelMap() {
                var result = {};

                selectedSuLevels.forEach(function (suLevel) {
                    result[suLevel.users] = allQuickPricingArguments.bulkComment;
                });

                return result;
            }
        }

        function updateCommentMarkers() {
            $('.offering .price').each(function (index) {
                setCommentMarkerVisibility(this);
            });
        }

        function applySuPricingToSelectedProducts(pricingItem) {
            var users = pricingItem.users;
            var pricingValue = parseFloat(pricingItem.price);

            if ( typeof pricingItem.price === 'undefined' || pricingItem.price === null || pricingItem.price === 0 ) {
                markCellsChanged(users);
            }

            if (isNaN(pricingValue)) {
                return;
            }

            var newPrice = pricingValue.toFixed(2);

            $('.price-row.su-' + users + ' .offering').each(function (i, cell) {
                var $cell = $(cell);
                var productId = $cell.data('productId');

                if (productIsSelected(productId)) {
                    $('.price', $cell).text(newPrice).removeClass('no-pricing');
                    markProductChanged(productId);
                }
            });
        }

        function applySuPercentageIncreaseToSelectedProducts(pricingItem) {
            var users = pricingItem.users;
            var percentIncrease = pricingItem.percent;

            $('.price-row.su-' + users + ' .offering').each(function (i, cell) {
                var $cell = $(cell);
                var productId = $cell.data('productId');

                if (productIsSelected(productId)) {
                    applyPercentageIncreaseToCell();
                }

                function applyPercentageIncreaseToCell() {
                    var originalValue = parseFloat($cell.text());
                    var newValue = (100 + percentIncrease) / 100 * originalValue;
                    newValue = newValue.toFixed(2);
                    $('.price', $cell).text(newValue).removeClass('no-pricing');
                    markProductChanged(productId);
                }
            });
        }

        function markCellsChanged(users) {
            $('.price-row.su-' + users + ' .offering').each(function (i, cell) {
                var $cell = $(cell);
                var productId = $cell.data('productId');

                if (productIsSelected(productId)) {
                    $(cell).addClass('updated');
                    markProductChanged(productId);
                }
            });
        }
    }

    function markProductChanged(productId) {
        vm.changedProductIds[productId] = true;
        enableUnsavedChangesWarning();
    }

    function productIsSelected(productId) {
        return vm.selectedProductIds[productId];
    }

    function selectedProductIds() {
        return Object.keys(vm.selectedProductIds).filter(productIsSelected);
    }

    function nextSuLevel() {
        var max = 0;
        vm.suLevels.forEach(function (su) {
            if (su.users > max) {
                max = su.users;
            }
        });
        return max + 1;
    }

    function updateFlaggedStatusForProduct(productId) {
        var suPricing = getSuPricingFromFormForProduct(productId);
        var testOffering = {
            product: {},
            pricing: {
                site: Infinity,
                su: suPricing
            },
            suPricesUpdated: true
        };
        
        $productCells = $('.' + productId);
        if (offeringService.getFlaggedState(testOffering, {})) {
            $productCells.addClass('flagged');
            $productCells.attr('title', testOffering.flaggedReason[0]);
        }
        else {
            $productCells.removeClass('flagged');
            $productCells.attr('title', '');
        }
    }

    function downloadCsv() {
        var pricingData = gatherPricingDataForCsvExport();

        vm.loadingPromise = simultaneousUserPricesCsvData(vm.products, vm.suLevels, pricingData)
            .then(csvExportService.exportToCsv)
            .then(function (csvContent) {
                csvExportService.browserDownloadCsv(csvContent, makeFilename());
            })
            .catch(function (err) {
                Logger.log('CSV generation failed', err);
            });

        return vm.loadingPromise;

        function gatherPricingDataForCsvExport() {
            var suPricesByProduct = {};

            vm.suLevels.forEach(function (suLevel) {
                var users = suLevel.users;
                suPricesByProduct[users] = {};

                var $productRow = $('.pricing-grid .price-row.su-' + users);

                $('.offering', $productRow).each(function () {
                    var $cell = $(this);
                    var productId = $cell.data('productId');
                    var price = parseFloat($cell.text());

                    if (!isNaN(price)) {
                        suPricesByProduct[users][productId] = price;
                    }
                });
            });

            return suPricesByProduct;
        }

        function makeFilename() {
            var vendorName = authService.getCurrentUser().vendor.name;
            var cycleName = cycleService.getCurrentCycle().name;
            return vendorName + ' ' + cycleName + ' SU Prices.csv';
        }
    }

    function getProductById(productId) {
        return vm.products.filter(function (product) {
            return product.id === productId;
        })[0];
    }

    function csvExportIsDisabled() {
        return thereAreUnsavedChanges();
    }

    function thereAreUnsavedChanges() {
        return Object.keys(vm.changedProductIds).length > 0;
    }

    function enableUnsavedChangesWarning() {
        $scope.warningForm.$setDirty();
    }

    function disableUnsavedChangesWarning() {
        $scope.warningForm.$setPristine();
    }
}

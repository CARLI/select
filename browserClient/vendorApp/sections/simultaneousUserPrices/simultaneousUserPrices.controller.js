angular.module('vendor.sections.simultaneousUserPrices')
    .controller('simultaneousUserPricesController', simultaneousUserPricesController);

function simultaneousUserPricesController($scope, $q, $filter, cycleService, offeringService, productService, userService, vendorStatusService){
    var vm = this;
    vm.changedProductIds = {};
    vm.loadingPromise = null;
    vm.productsSaved = 0;
    vm.productsSavedProgress = 0;

    vm.selectedProductIds = {};
    vm.selectedSuLevelIds = {};
    vm.suPricingByProduct = {};
    vm.suLevels = [];
    vm.totalProducts = 0;

    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.addSuPricingLevel = addSuPricingLevel;
    vm.nextSuLevel = nextSuLevel;
    vm.saveOfferings = saveOfferings;
    vm.quickPricingCallback = quickPricingCallback;

    activate();

    function activate() {
        vm.vendorId = userService.getUser().vendor.id;

        vm.loadingPromise = loadProducts()
            .then(getSuPricingForAllProducts)
            .then(initializeSuLevelsFromPricing)
            .then(initializeSelectedProductIds)
            .then(initializeSelectedSuLevelIds)
            .then(buildPricingGrid);
    }



    function loadProducts() {
        return productService.listActiveProductsForVendorId( vm.vendorId ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
            return products;
        });
    }

    function getSuPricingForAllProducts( productList ){
        return $q.all( productList.map(loadSuLevelsForProduct) );

        function loadSuLevelsForProduct( product ){
            return offeringService.getOneOfferingForProductId(product.id).then(function(offering){
                var representativeOffering = offering || {};
                var pricingForProduct = representativeOffering.pricing || {};
                var suPricingForProduct = pricingForProduct.su || [];

                vm.suPricingByProduct[product.id] = convertArrayOfPricingObjectsToMappingObject(suPricingForProduct);

                return vm.suPricingByProduct[product.id];
            });

            function convertArrayOfPricingObjectsToMappingObject( suPricing ){
                var suPricingMap = {};
                suPricing.forEach(function( suPricingObject ){
                    suPricingMap[suPricingObject.users] = suPricingObject.price;
                });
                return suPricingMap;
            }
        }
    }

    function initializeSuLevelsFromPricing(){
        var combinedSuLevels = {};

        vm.products.forEach(function(product){
            var pricingObject = vm.suPricingByProduct[product.id];
            Object.keys(pricingObject).forEach(function(suLevel){
                combinedSuLevels[suLevel] = true;
            });
        });

        vm.suLevels = Object.keys(combinedSuLevels).map(makeSuLevel);

        if ( vm.suLevels.length === 0 ){
            vm.suLevels = [1,2,3].map(makeSuLevel);
        }
    }

    function makeSuLevel(level){
        return {
            id: 'su-'+level,
            name: suLevelName(level),
            shortName: suLevelShortName(level),
            users: level - 0
        };

        function suLevelName(level){
            return level + ' Simultaneous User' + (level > 1 ? 's' : '');
        }

        function suLevelShortName(level){
            return level + ' S.U.';
        }
    }

    function initializeSelectedProductIds() {
        vm.products.forEach(function(product) {
            vm.selectedProductIds[product.id] = true;
        });
        $scope.$watchCollection(getSelectedProductIds, updateVisibilityOfCellsForSelectedProducts);
        function getSelectedProductIds() { return vm.selectedProductIds; }
    }

    function initializeSelectedSuLevelIds() {
        vm.suLevels.forEach(function(su) {
            vm.selectedSuLevelIds[su.id] = true;
        });
        $scope.$watchCollection(getSelectedSuLevelIds, updateVisibilityOfRowsForSelectedSuLevels);
        function getSelectedSuLevelIds() { return vm.selectedSuLevelIds; }
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

    function buildPricingGrid() {
        vm.suLevels.forEach(function (level) {
            makeSuPricingRow(level);
        });
    }

    function makeSuPricingRow(level) {
        var row = $('<div class="price-row">');
        row.addClass('su-'+level.users);

        vm.products.forEach(function (product) {
            row.append(generateOfferingCell(level, product));
        });

        $('.pricing-grid').append(row);

        return row;

        function generateOfferingCell(suLevel, product) {
            var priceForProduct = vm.suPricingByProduct[product.id][suLevel.users];
            var offeringWrapper = $('<div class="column offering input">');
            var offeringCellContent = createOfferingCellContent(priceForProduct);
            var offeringCell = offeringWrapper.append(offeringCellContent);

            offeringWrapper.on('click', function() {
                $(this).children().first().focus();
            });

            offeringCell.data('productId', product.id);
            offeringCell.addClass(product.id);

            return offeringCell;
        }
    }

    function createOfferingCellContent(price){
        if ( price > 0 || price === 0 ){
            return createReadOnlyOfferingCell(price);
        }
        else {
            return createEmptyOfferingCell();
        }
    }

    function createReadOnlyOfferingCell(price) {
        var cell = $('<div tabindex="0" class="price">'+price+'</div>');
        cell.on('focus', makeEditable);
        return cell;
    }

    function createEmptyOfferingCell(){
        var cell = $('<div tabindex="0" class="price no-pricing">&nbsp;</div>');
        cell.on('focus', makeEditable);
        return cell;
    }

    function createEditableOfferingCell(price) {
        var cell = $('<input class="price-editable" type="text" step=".01" min="0" value="' + price + '">');
        cell.on('blur', makeReadOnly);
        return cell;
    }

    function makeEditable() {
        var price = $(this).text();
        var input = createEditableOfferingCell(price);
        $(this).replaceWith(input);
        input.focus().select();
    }

    function makeReadOnly() {
        var $cell = $(this);
        markProductChangedForCell( $cell.parent() );
        var price = $cell.val();
        var div = createOfferingCellContent(price);
        $cell.replaceWith(div);
    }

    function markProductChangedForCell( jqueryCell ){
        var classList = jqueryCell.attr('class').split(/\s+/);
        classList.forEach(function(className){
            if ( className !== 'column' && className !== 'offering' && className !== 'input' ){
                vm.changedProductIds[className] = true;
            }
        });
    }

    function saveOfferings(){
        var newSuPricingByProduct = {};

        vm.products.forEach(function(product){
            newSuPricingByProduct[product.id] = [];

            vm.suLevels.forEach(function(suLevel){
                var users = suLevel.users;
                var $productCellForSu = $('.price-row.su-'+users+' .'+product.id);
                var newPrice = parseFloat( $productCellForSu.text() );

                if ( !isNaN(newPrice) ){
                    newSuPricingByProduct[product.id].push({
                        users: users,
                        price: newPrice
                    });
                }
            });
        });

        var productIdsToUpdate = Object.keys(vm.changedProductIds).filter(function(id){
            return vm.changedProductIds[id];
        });

        if ( productIdsToUpdate.length < 4 ){
            vm.loadingPromise = updateChangedProductsConcurrently();
        }
        else {
            vm.loadingPromise = updateChangedProductsSeriallyWithProgressBar();
        }

        return vm.loadingPromise;


        function updateChangedProductsConcurrently(){
            return $q.all( productIdsToUpdate.map(updateOfferingsForAllLibrariesForProduct) )
                .then(updateVendorFlaggedOfferings)
                .then(updateVendorStatus)
                .then(syncData)
                .then(function(){
                    vm.changedProductIds = {};
                    console.log('saved '+productIdsToUpdate.length+' products');
                })
                .catch(function(err){
                    console.error(err);
                });
        }

        function updateChangedProductsSeriallyWithProgressBar(){
            var saveAllProductsPromise = $q.defer();

            vm.productsSaved = 0;
            vm.productsSavedProgress = 0;
            vm.totalProducts = productIdsToUpdate.length;

            $('#progress-modal').modal({
                backdrop: 'static',
                keyboard: false
            });

            $scope.warningForm.$setDirty();

            saveNextProduct();

            function saveNextProduct(){
                if ( vm.productsSaved === vm.totalProducts ){
                    serialSaveFinished();
                    return;
                }

                return updateOfferingsForAllLibrariesForProduct( productIdsToUpdate[vm.productsSaved] )
                    .then(function(){
                        vm.productsSaved++;
                        vm.productsSavedProgress = Math.floor((vm.productsSaved / vm.totalProducts) * 100);
                        saveNextProduct();
                    });
            }

            return saveAllProductsPromise.promise;


            function serialSaveFinished(){
                return updateVendorFlaggedOfferings()
                    .then(updateVendorStatus)
                    .then(syncData) //Enhancement: get couch replication job progress, show it in the 2nd progress bar
                    .then(function(){
                        $('#progress-modal').modal('hide');
                        $scope.warningForm.$setPristine();
                        saveAllProductsPromise.resolve();
                    });
            }
        }

        function updateOfferingsForAllLibrariesForProduct( productId ){
            var newSuPricing = newSuPricingByProduct[productId];
            return offeringService.updateSuPricingForAllLibrariesForProduct(productId, newSuPricing );
        }

        function updateVendorStatus(){
            return vendorStatusService.updateVendorStatusActivity( 'Simultaneous User Prices Updated', vm.vendorId, cycleService.getCurrentCycle() );
        }

        function updateVendorFlaggedOfferings(){
            return vendorStatusService.updateVendorStatusFlaggedOfferings( vm.vendorId, cycleService.getCurrentCycle() );
        }

        function syncData(){
            return cycleService.syncDataBackToCarli();
        }
    }



    function addSuPricingLevel( numberOfUsers ){
        var newLevel = makeSuLevel( numberOfUsers );

        if ( suLevelExists() ){
            return;
        }

        vm.suLevels.push(newLevel);
        vm.selectedSuLevelIds[newLevel.id] = true;

        makeSuPricingRow(newLevel);


        function suLevelExists(){
            return vm.suLevels.filter(function(suLevel){
                return suLevel.users === numberOfUsers;
            }).length;
        }
    }

    function quickPricingCallback(mode, pricingBySuLevel) {
        var selectedSuLevels = vm.suLevels.filter(function (suLevel) {
            return vm.selectedSuLevelIds[suLevel.id];
        });

        if ( mode === 'dollarAmount' ){
            var suLevelPricesToInsert = selectedSuLevels.map(function(suLevel){
                return {
                    users: suLevel.users,
                    price: pricingBySuLevel[suLevel.users]
                };
            });


            suLevelPricesToInsert.forEach(applySuPricingToSelectedProducts);
        }
        else {
            var suLevelPercentagesToApply = selectedSuLevels.map(function(suLevel){
                return {
                    users: suLevel.users,
                    percent: pricingBySuLevel[suLevel.users]
                };
            });

            suLevelPercentagesToApply.forEach(applySuPercentageIncreaseToSelectedProducts);
        }

        function applySuPricingToSelectedProducts( pricingItem ){
            var users = pricingItem.users;
            var price = pricingItem.price;

            $('.price-row.su-'+users+' .offering').each(function(i, cell){
                var $cell = $(cell);
                var productId = $cell.data('productId');

                if ( productIsSelected(productId) ){
                    $('.price', $cell).text(price).removeClass('no-pricing');
                    markProductChanged(productId);
                }
            });
        }

        function applySuPercentageIncreaseToSelectedProducts( pricingItem ){
            var users = pricingItem.users;
            var percentIncrease = pricingItem.percent;

            $('.price-row.su-'+users+' .offering').each(function(i, cell){
                var $cell = $(cell);
                var productId = $cell.data('productId');

                if ( productIsSelected(productId) ){
                    applyPercentageIncreaseToCell();
                }

                function applyPercentageIncreaseToCell(){
                    var originalValue = parseFloat($cell.text());
                    var newValue = (100 + percentIncrease)/100 * originalValue;
                    // TODO round this to the nearest cent?
                    $('.price', $cell).text( newValue ).removeClass('no-pricing');
                    markProductChanged(productId);
                }
            });
        }

        function productIsSelected(productId){
            return vm.selectedProductIds[productId];
        }

        function markProductChanged( productId ){
            vm.changedProductIds[productId] = true;
        }
    }

    function nextSuLevel(){
        var max = 0;
        vm.suLevels.forEach(function(su){
            if ( su.users > max ){
                max = su.users;
            }
        });
        return max + 1;
    }
}

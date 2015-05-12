angular.module('vendor.sections.simultaneousUserPrices')
    .controller('simultaneousUserPricesController', simultaneousUserPricesController);

function simultaneousUserPricesController($scope, $q, $filter, cycleService, offeringService, productService, userService){
    var vm = this;
    vm.loadingPromise = null;
    vm.suPricingByProduct = {};
    vm.suLevels = [];
    vm.selectedProductIds = {};
    vm.selectedSuLevelIds = {};
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.addSuPricingLevel = addSuPricingLevel;
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
        return productService.listProductsForVendorId( vm.vendorId ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
            return products;
        });
    }

    function getSuPricingForAllProducts( productList ){
        return $q.all( productList.map(loadSuLevelsForProduct) );

        function loadSuLevelsForProduct( product ){
            return offeringService.getOneOfferingForProductId(product.id).then(function(representativeOffering){
                var suPricingForProduct = representativeOffering ? representativeOffering.pricing.su : [];

                vm.suPricingByProduct[product.id] = convertArrayOfPricingObjectsToMappingObject(suPricingForProduct);

console.log('got su pricing for '+product.name, vm.suPricingByProduct[product.id]);
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

        function makeSuLevel(level){
            return {
                id: 'su-'+level,
                name: suLevelName(level),
                users: level
            };

            function suLevelName(level){
                return level + ' Simultaneous User' + (level > 1 ? 's' : '');
            }
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
console.log('  price for '+suLevel.users+' user - '+product.name+' ', vm.suPricingByProduct[product.id][suLevel.users]);

            var priceForProduct = vm.suPricingByProduct[product.id][suLevel.users] || 0;
            var offeringWrapper = $('<div class="column offering input">');
            var offeringCell = offeringWrapper.append(createReadOnlyOfferingCell(priceForProduct));

            offeringWrapper.on('click', function() {
                $(this).children().first().focus();
            });

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
        var newSuPricingByProduct = {};

        vm.products.forEach(function(product){
            newSuPricingByProduct[product.id] = [];

            vm.suLevels.forEach(function(suLevel){
                var users = suLevel.users;
                var $productCellForSu = $('.price-row.su-'+users+' .'+product.id);
                var newPrice = parseFloat( $productCellForSu.text() );

                newSuPricingByProduct[product.id].push({
                    users: users,
                    price: newPrice
                });
            });
        });

        return $q.all( vm.products.map(updateOfferingsForAllLibrariesForProduct) )
            .then(function(updateResults){
                console.log('saved '+vm.products.length+' products',updateResults);
            })
            .catch(function(err){
                console.error(err);
            });

        function updateOfferingsForAllLibrariesForProduct( product ){
            var newSuPricing = newSuPricingByProduct[product.id];
            return offeringService.updateSuPricingForAllLibrariesForProduct(product.id, newSuPricing );
        }
    }



    function addSuPricingLevel(){
        var newLevel = makeSuLevel( highestSuLevel() +1 );

        vm.suLevels.push(newLevel);
        vm.selectedSuLevelIds[newLevel.id] = true;

        makeSuPricingRow(newLevel);

        function highestSuLevel(){
            var max = 0;
            vm.suLevels.forEach(function(su){
                if ( su.users > max ){
                    max = su.users;
                }
            });
            return max;
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
                    $('.price', $cell).text(price);
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
                    $('.price', $cell).text( newValue );
                }
            });
        }

        function productIsSelected(productId){
            return vm.selectedProductIds[productId];
        }
    }
}

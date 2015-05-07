angular.module('vendor.sections.simultaneousUserPrices')
    .controller('simultaneousUserPricesController', simultaneousUserPricesController);

function simultaneousUserPricesController($scope, $q, $filter, cycleService, libraryService, offeringService, productService, userService){
    var vm = this;
    vm.loadingPromise = null;
    vm.suLevels = [];
    vm.selectedProductIds = {};
    vm.selectedSuLevelIds = {};
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.addSuPricingLevel = addSuPricingLevel;
    vm.saveOfferings = saveOfferings;
    vm.quickPricingCallback = quickPricingCallback;

    activate();

    function activate() {
        vm.suLevels = defaultSuLevels();
        initializeSelectedSuLevelIds();

        vm.loadingPromise = loadProducts()
            .then(buildPricingGrid);
    }

    function defaultSuLevels(){
        return [1,2,3].map(makeSuLevel);
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

    function loadProducts() {
        return productService.listProductsForVendorId( userService.getUser().vendor.id ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
            initializeSelectedProductIds();
        });
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
            //var priceForProduct = product.suPricing[suLevel.users];
            var priceForProduct = 0;
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
        var cycle = cycleService.getCurrentCycle();
        var changedOfferings = [];
        var newOfferings = [];
        var offeringCells = $('#price-rows .offering');

        offeringCells.each(function(index, element){
            var offeringCell = $(element);
            var libraryId = offeringCell.data('libraryId');
            var productId = offeringCell.data('productId');
            var offering = vm.priceForSuByProduct[productId][libraryId];
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
        }
        else {
            var suLevelPercentagesToApply = selectedSuLevels.map(function(suLevel){
                return {
                    users: suLevel.users,
                    percent: pricingBySuLevel[suLevel.users]
                };
            });

            console.log('apply percentages ',suLevelPercentagesToApply);

            suLevelPercentagesToApply.forEach(applySuPercentageIncreaseToSelectedProducts);

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
        }

        function productIsSelected(productId){
            return vm.selectedProductIds[productId];
        }
    }
}

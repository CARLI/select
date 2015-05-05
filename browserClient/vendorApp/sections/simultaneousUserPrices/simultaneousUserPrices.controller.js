angular.module('vendor.sections.simultaneousUserPrices')
    .controller('simultaneousUserPricesController', simultaneousUserPricesController);

function simultaneousUserPricesController($scope, $q, $filter, cycleService, libraryService, offeringService, productService, userService){
    var vm = this;
    vm.loadingPromise = null;
    vm.selectedProductIds = {};
    vm.getProductDisplayName = productService.getProductDisplayName;

    vm.suLevels = [1,2,3];

    vm.saveOfferings = saveOfferings;

    activate();

    function activate() {
        vm.loadingPromise = loadProducts()
            .then(buildPriceArray)
            .then(buildPricingGrid);
    }

    function loadProducts() {
        return productService.listProductsWithOfferingsForVendorId( userService.getUser().vendor.id ).then(function (products) {
            vm.products = $filter('orderBy')(products, 'name');
            initializeSelectedProductIds();
        });
    }

    function initializeSelectedProductIds() {
        vm.products.forEach(function(product) {
            vm.selectedProductIds[product.id] = true;
        });
        $scope.$watchCollection(getSelectedProductIds, updateVisibilityOfElementsWithEntityIdClasses);
        function getSelectedProductIds() { return vm.selectedProductIds; }
    }

    function updateVisibilityOfElementsWithEntityIdClasses(selectedEntities) {
        if (selectedEntities) {
            Object.keys(selectedEntities).forEach(function (entityId) {
                var displayValue = selectedEntities[entityId] ? 'flex' : 'none';
                $('.' + entityId).css('display', displayValue);
            });
        }
    }


    function buildPriceArray() {

        vm.priceForSuByProduct = {};

        vm.products.forEach(function (product) {
            vm.priceForSuByProduct[product.id] = {};

            product.offerings.forEach(function (offering) {
                if ( offering.pricing.su ){
                    offering.pricing.su.forEach(function(price){
                        var suLevel = price.users;
                        vm.priceForSuByProduct[product.id][suLevel] = price.price;
                    });
                }
            });
        });
    }

    function buildPricingGrid() {
        var priceRows = $('<div>').attr('id','price-rows');

        vm.suLevels.forEach(function (level) {
            var row = generateSuRow(level);
            vm.products.forEach(function (product) {
                row.append(generateOfferingCell(level, product));
            });
            priceRows.append(row);
        });

        $('#price-rows').replaceWith(priceRows);

        function generateSuRow(level) {
            var row = $('<div class="price-row">');
            row.addClass(level+'su');
            return row;
        }

        function generateOfferingCell(suLevel, product) {
            var price = vm.priceForSuByProduct[product.id][suLevel] || 0 ;
            var offeringWrapper = $('<div class="column offering input">');
            var offeringCell = offeringWrapper.append(createReadOnlyOfferingCell(price));

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
            input.focus();
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
}

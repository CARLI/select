(function() {
    angular.module('carli.sections.oneTimePurchases.selectedProducts')
        .controller('selectedProductsController', selectedProductsController);

    function selectedProductsController($scope, $routeParams, config, cycleService, libraryService, offeringService, alertService) {
        var vm = this;
        vm.libraryId = $routeParams.libraryId;
        vm.offeringList = [];
        vm.orderBy = 'name';
        vm.reverse = false;
        vm.selectedProducts = {};

        vm.purchaseProduct = purchaseProduct;
        vm.cancelPurchase = cancelPurchase;
        vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
        vm.invoiceProducts = invoiceProducts;
        vm.reportProducts = reportProducts;
        vm.sort = sort;

        initFilterableByPurchased($scope, vm);
        activate();

        function activate(){
            vm.loadingPromise = setCycleToOneTimePurchase()
            .then(loadLibrary)
            .then(loadOfferingsForLibrary);
        }

        function setCycleToOneTimePurchase(){
            return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function(oneTimePurchaseCycle){
                cycleService.setCurrentCycle(oneTimePurchaseCycle);
                return oneTimePurchaseCycle;
            });
        }

        function loadLibrary() {
            return libraryService.load(vm.libraryId).then(function(library){
                vm.library = library;
                return library;
            });
        }

        function loadOfferingsForLibrary( library ) {
            return offeringService.listOfferingsForLibraryId(library.id)
            .then(function (offeringList) {
                vm.offeringList = offeringList;
                return offeringList;
            });
        }

        function refreshOfferingsForLibrary(library){
            return loadOfferingsForLibrary(library);
        }

        function purchaseProduct(offering) {
            offering.datePurchased = new Date().toJSON().slice(0,10);
            offeringService.update(offering)
            .then(function(){
                alertService.putAlert(offering.product.name + " purchased", {severity: 'success'});
                refreshOfferingsForLibrary(vm.library);
            })
            .catch(function(error){
                alertService.putAlert(error, {severity: 'danger'});
                refreshOfferingsForLibrary(vm.library);
            });
        }

        function cancelPurchase(offering) {
            var oldDate = offering.datePurchased;
            delete offering.datePurchased;
            
            offeringService.update(offering)
            .then(function(){
                alertService.putAlert(offering.product.name + " purchase cancelled", {severity: 'success'});
                refreshOfferingsForLibrary(vm.library);
            })
            .catch(function(error){
                alertService.putAlert(error, {severity: 'danger'});
                refreshOfferingsForLibrary(vm.library);
            });
        }

        function computeTotalPurchasesAmount() {
            var totalAmount = 0;
            var offering;

            for (var i=0; i<vm.offeringList.length; i++) {
                offering = vm.offeringList[i];
                if (vm.filter(offering) && offering.datePurchased) {
                    totalAmount += offering.pricing.site;
                }
            }
            return totalAmount;
        }

        function invoiceProducts() {
            alert("Invoice Products:" + JSON.stringify(vm.selectedProducts));
        }

        function reportProducts() {
            alert("Report Products:" + JSON.stringify(vm.selectedProducts));
        }

        function sort( newOrderBy ){
            if ( !newOrderBy ){
                return;
            }

            if ( vm.orderBy === newOrderBy){
                vm.reverse = !vm.reverse;
            }
            else {
                vm.orderBy = newOrderBy;
                vm.reverse = false;
            }
        }
    }

    function initFilterableByPurchased(scope, vm) {
        vm.filterState = 'all';
        vm.filter = filter;
        vm.setShowPurchasedProducts = setShowPurchasedProducts;
        vm.setShowNotPurchasedProducts = setShowNotPurchasedProducts;
        vm.setShowAllProducts = setShowAllProducts;

        var element = $('.filter-by-purchased');
        makeKeyboardAccessible();

        function filter( offering ){
            var isProductPurchased = offering.datePurchased;

            filterValue =   (vm.filterState === 'all') ||
            (vm.filterState === 'purchased' && isProductPurchased) ||
            (vm.filterState === 'not-purchased' && !isProductPurchased);

            return filterValue;
        }

        function setShowPurchasedProducts() {
            vm.filterState = 'purchased';
            unselectHiddenProducts();
        }

        function setShowNotPurchasedProducts() {
            vm.filterState = 'not-purchased';
            unselectHiddenProducts();
        }

        function setShowAllProducts() {
            vm.filterState = 'all';
            unselectHiddenProducts();
        }

        function unselectHiddenProducts() {
            var key, product;
            for ( key in vm.offeringList ){
                offering = vm.offeringList[key];
                if ( !filter(offering) ){
                    vm.selectedProducts[offering.id] = false;
                }
            }
        }

        function makeKeyboardAccessible() {
            // Must use keydown to prevent scrolling the page when toggling the checkbox.
            element.find('#filter-purchased .fa').on('keydown', onSpaceBarApply(setShowPurchasedProducts));
            element.find('#filter-not-purchased .fa').on('keydown', onSpaceBarApply(setShowNotPurchasedProducts));
            element.find('#filter-all .fa').on('keydown', onSpaceBarApply(setShowAllProducts));
        }
        function onSpaceBarApply(callback) {
            var keyCode = { SPACE: 32 };

            return function (e) {
                if (e.keyCode == keyCode.SPACE) {
                    preventScrolling(e);
                    scope.$apply(callback);
                }
            };
        }
        function preventScrolling(e) {
            e.preventDefault();
        }
    }
})();

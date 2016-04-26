(function() {
    angular.module('carli.sections.oneTimePurchases.selectedProducts')
        .controller('selectedProductsController', selectedProductsController);

    function selectedProductsController($scope, $routeParams, $q, activityLogService, alertService, config, cycleService, errorHandler, libraryService, notificationModalService, offeringService, vendorService, productService) {
        var vm = this;
        vm.libraryId = $routeParams.libraryId;
        vm.offeringList = [];
        vm.orderBy = 'product.name';
        vm.reverse = false;
        vm.selectedOfferings = {};

        vm.purchaseProduct = purchaseProduct;
        vm.cancelPurchase = cancelPurchase;
        vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
        vm.englishSummaryOfDisplayProperty = englishSummaryOfDisplayProperty;
        vm.invoiceProducts = invoiceProducts;
        vm.reportProducts = reportProducts;
        vm.invoiceAnnualAccessFees = invoiceAnnualAccessFees;
        vm.sort = sort;
        vm.getProductDisplayName = productService.getProductDisplayName;
        vm.isFunded = isFunded;
        vm.getFundedSelectionPrice = getFundedSelectionPrice;
        vm.getFundedSiteLicensePrice = getFundedSiteLicensePrice;
        vm.saveComments = saveComments;

        vm.sortOptions = {
            productName: 'product.name',
            vendorName: ['product.vendor.name','product.name'],
            cost: [offeringService.getFundedSelectionPrice,'product.name']
        };

        initFilterableByPurchased($scope, vm);
        activate();

        function activate(){
            vm.loadingPromise = setCycleToOneTimePurchase()
            .then(loadLibrary)
            .then(loadOfferingsForLibrary);
        }

        function setCycleToOneTimePurchase(){
            return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function(oneTimePurchaseCycle){
                vm.cycle = oneTimePurchaseCycle;
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
                .then(populateVendorsForOfferings)
                .then(returnOfferingsForActiveProducts)
                .then(function (activeOfferings) {
                    vm.offeringList = activeOfferings;
                });

            function populateVendorsForOfferings( offeringsList ){
                return $q.all(offeringsList.map(loadVendor));

                function loadVendor(offering){
                    if (typeof offering.product.vendor == 'object') {
                        return $q.when(offering);
                    } else {
                        return vendorService.load(offering.product.vendor)
                            .then(function(vendor){
                                offering.product.vendor = vendor;
                                return offering;
                            });
                    }
                }
            }

            function returnOfferingsForActiveProducts(offeringList) {
                return offeringList.filter(active);
            }
        }

        function active(offering) {
            return offering.product && offering.product.isActive;
        }

        function refreshOfferingsForLibrary(library){
            return loadOfferingsForLibrary(library);
        }

        function purchaseProduct(offering) {
            offering.selection = {
                users: offeringService.siteLicenseSelectionUsers,
                price: offering.pricing.site,
                datePurchased: new Date().toJSON().slice(0, 10)
            };
            offeringService.update(offering)
            .then(function(){
                alertService.putAlert(productService.getProductDisplayName(offering.product) + " purchased", {severity: 'success'});
                activityLogService.logOtpPurchase(offering);
                refreshOfferingsForLibrary(vm.library);
            })
            .then(syncDataToVendor(offering))
            .catch(function(error){
                alertService.putAlert('Product purchase was not successful, please try again.', {severity: 'danger'});
                errorHandler(error);
                refreshOfferingsForLibrary(vm.library);
            });
        }

        function cancelPurchase(offering) {
            delete offering.selection;
            
            offeringService.update(offering)
            .then(function(){
                alertService.putAlert(productService.getProductDisplayName(offering.product) + " purchase cancelled", {severity: 'success'});
                activityLogService.logOtpPurchaseCancelled(offering);
                refreshOfferingsForLibrary(vm.library);
            })
            .then(syncDataToVendor(offering))
            .catch(function(error){
                alertService.putAlert('Product purchase was not cancelled, please try again.', {severity: 'danger'});
                errorHandler(error);
                refreshOfferingsForLibrary(vm.library);
            });
        }

        function saveComments(offering){
            return saveOffering(offering)
                .then(function(){
                    alertService.putAlert(productService.getProductDisplayName(offering.product) + " comments saved", {severity: 'success'});
                    refreshOfferingsForLibrary(vm.library);
                })
                .catch(function(error){
                    alertService.putAlert('Product comments were not saved, please try again.', {severity: 'danger'});
                    errorHandler(error);
                    refreshOfferingsForLibrary(vm.library);
                });
        }

        function saveOffering(offering){
            return offeringService.update(offering)
                .then(syncDataToVendor(offering))
                .finally(function(){
                    refreshOfferingsForLibrary(vm.library);
                });
        }

        function syncDataToVendor(offering){
            return function(){
                return cycleService.syncDataToVendorDatabase(offering.vendorId, vm.cycle);
            };
        }

        function computeTotalPurchasesAmount() {
            var totalAmount = 0;
            var offering;

            for (var i=0; i<vm.offeringList.length; i++) {
                offering = vm.offeringList[i];
                if (vm.filter(offering) && offering.selection) {
                    totalAmount += offeringService.getFundedSelectionPrice(offering);
                }
            }
            return totalAmount;
        }

        function invoiceProducts() {
            var offeringIds = flattenSelectedOfferingsObject();

            notificationModalService.sendStartDraftMessage({
                templateId: 'notification-template-library-invoices',
                cycleId: cycleService.getCurrentCycle().id,
                offeringIds: offeringIds
            });
        }

        function reportProducts() {
            var offeringIds = flattenSelectedOfferingsObject();
            notificationModalService.sendStartDraftMessage({
                templateId: 'notification-template-vendor-reports',
                cycleId: cycleService.getCurrentCycle().id,
                offeringIds: offeringIds
            });
        }

        function invoiceAnnualAccessFees() {
            notificationModalService.sendStartDraftMessage({
                templateId: 'notification-template-annual-access-fee-invoices',
                recipientId: vm.libraryId
            });
        }

        function flattenSelectedOfferingsObject() {
            var offeringIds = [];

            Object.keys(vm.selectedOfferings).forEach(function(offeringId) {
                if (vm.selectedOfferings[offeringId]) {
                    offeringIds.push(offeringId);
                }
            });

            return offeringIds;
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

        function englishSummaryOfDisplayProperty(offering){
            if ( offering.display === 'without-price' ){
                return 'This product will be displayed to this library without a price.';
            }
            else if ( offering.display === 'none' ){
                return 'This product will not be displayed to this library.';
            }
            else {
                return 'This product will be displayed to this library normally.';
            }
        }

        function isFunded(offering) {
            return offeringService.isFunded(offering);
        }
        function getFundedSelectionPrice(offering) {
            return offeringService.getFundedSelectionPrice(offering);
        }
        function getFundedSiteLicensePrice(offering) {
            return offeringService.getFundedSiteLicensePrice(offering);
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
            var isProductPurchased = offering.selection;

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
                var offering = vm.offeringList[key];
                if ( !filter(offering) ){
                    vm.selectedOfferings[offering.id] = false;
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

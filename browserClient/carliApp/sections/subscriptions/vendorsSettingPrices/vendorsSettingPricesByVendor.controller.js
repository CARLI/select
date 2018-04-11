angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByVendorController', vendorsSettingPricesByVendorController);

function vendorsSettingPricesByVendorController( $scope, $filter, $q, accordionControllerMixin, config, controllerBaseService, cycleService, offeringService, editOfferingService, libraryService, offeringsByVendorExport, productService, vendorService, vendorStatusService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

    vm.closeVendorPricing = closeVendorPricing;
    vm.exportOfferingList = exportOfferingList;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.openVendorPricing = openVendorPricing;
    vm.stopEditing = stopEditing;
    vm.toggleProductSection = toggleProductSection;

    vm.cycle = {};
    vm.expandedProducts = {};
    vm.isEditing = {};
    vm.lastYear = '';
    vm.loadingPromise = {};
    vm.offeringColumns = [
        'library',
        'library-view',
        'site-license-price-both',
        'flag'
    ];
    vm.vendors = [];
    vm.vendorStatus = {};

    activate();

    function activate () {
        controllerBaseService.addSortable(vm, 'library.name');

        vm.cycle = cycleService.getCurrentCycle();
        vm.lastYear = vm.cycle.year - 1;

        loadVendors();
        connectEditButtons();
    }

    function connectEditButtons() {
        $scope.$watch(editOfferingService.receiveOfferingEditableMessage, receiveOfferingEditableMessage);

        function receiveOfferingEditableMessage(newOffering, oldOffering) {
            if (newOffering) {
                setOfferingEditable(newOffering);
                editOfferingService.acknowledgeOfferingMadeEditable();
            }
        }
    }

    function loadVendors() {
        vm.vendorLoadingPromise = productService.listProductCountsByVendorId()
            .then(function( productsByVendorId ){
                return Object.keys(productsByVendorId);
            })
            .then(vendorService.getVendorsById)
            .then(filterActiveVendors)
            .then(function (vendors) {
                vm.vendors = vendors;
            })
            .then(loadVendorStatuses);
    }

    function filterActiveVendors(vendorList){
        return vendorList.filter(vendorIsActive);

        function vendorIsActive(vendor){
            // Added a guard to allow list of vendors to still display
            // even if faulty data somehow entered the database
            if (typeof vendor === 'undefined')
                return false;
            return vendor.isActive;
        }
    }

    function loadVendorStatuses(){
        vm.vendorStatus = {};

        return vendorStatusService.list(vm.cycle)
            .then(function(vendorStatusList){
                vendorStatusList.forEach(function(vendorStatus){
                    vm.vendorStatus[vendorStatus.vendor] = vendorStatus;
                });
                return vm.vendorStatus;
            });
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return $q.when(vendor.products);
        }

        vm.loadingPromise[vendor.id] = productService.listActiveProductsForVendorId(vendor.id)
            .then(function(products) {
                vendor.products = products;
                return products;
            });

        return vm.loadingPromise[vendor.id];
    }

    function loadOfferingsForProduct(product){
        if ( product.offerings ){
            return $q.when(product.offerings);
        }

        return offeringService.listOfferingsForProductId(product.id)
            .then(filterOfferingsWithInactiveLibraries)
            .then(fillInNonCrmFields)
            .then(function(offerings){
                product.offerings = offerings;
                return offerings;
            });
    }

    function filterOfferingsWithInactiveLibraries(offeringsList){
        return offeringsList.filter(function(offering){
            return offering.library.isActive;
        });
    }

    function fillInNonCrmFields(offerings) {
        return offeringService.populateNonCrmLibraryData(offerings, libraryService.listActiveLibraries());
    }

    function toggleProductSection(product){
        if ( vm.expandedProducts[product.id] ){
            delete vm.expandedProducts[product.id];
        }
        else {
            var loadingPromise = loadOfferingsForProduct(product)
                .then(function(){
                    vm.expandedProducts[product.id] = true;
                });
            vm.loadingPromise[product.id] = loadingPromise;
        }
    }

    function closeVendorPricing( vendor ){
        return vendorStatusService.closePricingForVendor( vendor.id, vm.cycle )
            .then(function(){
                vm.vendorStatus[vendor.id].isClosed = true;
                return vendor.id;
            })
            .then(syncData);
    }

    function openVendorPricing( vendor ){
        return vendorStatusService.openPricingForVendor( vendor.id, vm.cycle )
            .then(function(){
                vm.vendorStatus[vendor.id].isClosed = false;
                return vendor.id;
            })
            .then(syncData);
    }

    function syncData(vendorId){
        return cycleService.syncDataToVendorDatabase(vendorId);
    }

    function getVendorPricingStatus(vendor) {
        var status = vm.vendorStatus[vendor.id] || {};
        return description() + openOrClosed();

        function description(){
            if ( status.lastActivity && status.description !== 'No Activity' ){
                return status.description + ' ' + $filter('date')(status.lastActivity);
            }
            return 'No Activity';
        }

        function openOrClosed(){
            return ' [Pricing ' + (status.isClosed ? 'Closed' : 'Open') + ']';
        }
    }

    function updateFlaggedStatusForVendor(vendorId) {
        var vendorStatus = vm.vendorStatus[vendorId];
        if ( vendorStatus && vendorStatus.flaggedOfferingsCount && !vendorStatus.wasPreviouslyComputedByThisMethod ) {
            /* Since we don't load all the products at once we can't be sure
             * that the total flags calculated below will be accurate, so
             * if we already have flags from the vendor status then keep that.
             * Note: this means the flag indicator could be incorrect if, for example,
             * the user manually clears the only flag.
             * In order to make this correct the system would need to trigger an
             * update of the vendor status, which happens in the vendor app. So
             * it would be tricky to do that from here. Theoretically, while the
             * system is open to vendors the activity should be updating often enough
             * to keep the vendor status counts accurate. */
            return;
        }

        var vendor = vm.vendors.filter(function(v){return v.id === vendorId;})[0];
        var flagCount = vendor.products.reduce(countFlagsForProduct, 0);
        vm.vendorStatus[vendorId] = { flaggedOfferingsCount: flagCount, wasPreviouslyComputedByThisMethod: true };


        function countFlagsForProduct(currentFlagCount, product) {
            var numberOfFlaggedOfferingsForProduct = 0;
            if ( product.offerings ) {
                numberOfFlaggedOfferingsForProduct = product.offerings.filter(isFlagged).length;
            }
            return currentFlagCount + numberOfFlaggedOfferingsForProduct;
        }

        function isFlagged(offering) {
            return offeringService.getFlaggedState(offering, vm.cycle);
        }
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
        updateFlaggedStatusForVendor(offering.vendorId);
    }

    function exportOfferingList(vendor) {
        return loadOfferingsForVendor().then(function() {
            return offeringsByVendorExport(vendor, vm.cycle, vm.offeringColumns);
        });

        function loadOfferingsForVendor() {
            return $q.all(vendor.products.map(loadOfferingsForProduct));
        }
    }
}

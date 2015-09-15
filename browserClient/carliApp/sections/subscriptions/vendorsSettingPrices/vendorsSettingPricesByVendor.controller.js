angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByVendorController', vendorsSettingPricesByVendorController);

function vendorsSettingPricesByVendorController( $scope, $filter, $q, accordionControllerMixin, controllerBaseService, cycleService, offeringService, editOfferingService, productService, vendorService, vendorStatusService, vendorsSettingPricesByVendorExport ) {
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

        vm.loadingPromise[product.id] = offeringService.listOfferingsForProductId(product.id)
            .then(filterActiveLibraries)
            .then(function(offerings){
                product.offerings = offerings;
                return offerings;
            });

        return vm.loadingPromise[product.id];
    }

    function filterActiveLibraries(offeringsList){
        return offeringsList.filter(function(offering){
            return offering.library.isActive;
        });
    }

    function toggleProductSection(product){
        if ( vm.expandedProducts[product.id] ){
            delete vm.expandedProducts[product.id];
        }
        else {
            loadOfferingsForProduct(product).then(function(){
                vm.expandedProducts[product.id] = true;
            });
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

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }

    function exportOfferingList(vendor) {
        return loadOfferingsForVendor().then(function() {
            return vendorsSettingPricesByVendorExport(vendor, vm.cycle, vm.offeringColumns);
        });

        function loadOfferingsForVendor() {
            return $q.all(vendor.products.map(loadOfferingsForProduct));
        }
    }
}

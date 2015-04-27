angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByVendorController', vendorsSettingPricesByVendorController);

function vendorsSettingPricesByVendorController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, vendorService, offeringService, editOfferingService, productService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

    vm.toggleProductSection = toggleProductSection;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.loadingPromise = {};
    vm.stopEditing = stopEditing;
    vm.vendors = [];
    vm.isEditing = {};
    vm.expandedProducts = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.offeringColumns = [
        'library',
        'library-view',
        'site-license-price-both',
        'flag'
    ];

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
            .then(function (vendors) {
                vm.vendors = vendors;
            });
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return $q.when(vendor.products);
        }

        vm.loadingPromise[vendor.id] = productService.listProductsForVendorId(vendor.id)
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
            .then(function(offerings){
                product.offerings = offerings;
                return offerings;
            });

        return vm.loadingPromise[product.id];
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

    function getVendorPricingStatus(vendor) {
        return "No activity";
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }
}

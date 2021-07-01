angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesByVendorController', carliCheckingPricesByVendorController);

function carliCheckingPricesByVendorController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, offeringService, editOfferingService, libraryService, offeringsByVendorExport, productService, vendorService, vendorStatusService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

    vm.exportOfferingList = exportOfferingList;
    vm.getProductDisplayName = productService.getProductDisplayName;
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

        loadDataForScreen();
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

    function loadDataForScreen() {
        vm.dataLoadingPromise = productService.listProductCountsByVendorId()
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
        return vendorList.filter(isValidVendor).filter(vendorIsActive);

        // Another guard to protect against illegitimate data inadvertently being in couch
        function isValidVendor(vendor) {
            return !!vendor;
        }

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

        return offeringService.listOfferingsForProductId(product.id)
            .then(filterOfferingsWithInactiveLibraries)
            .then(fillInNonCrmFields)
            .then(function(offerings){
                product.offerings = offerings.map(setSortableFlagStateOnOffering);
                return offerings;
            });
    }

    function setSortableFlagStateOnOffering(offering) {
        const isOrangeFlag = offeringService.getFlaggedState(offering) && !offering.flagged;
        const isPurpleFlag = offering.flagged === true;
        const isHollowPurpleFlag = offering.flagged === false;
        if(isOrangeFlag)
            offering.sortableFlagState = 0;
        else if(isPurpleFlag)
            offering.sortableFlagState = 1;
        else if(isHollowPurpleFlag)
            offering.sortableFlagState = 3;
        else
            offering.sortableFlagState = 2;

        return offering;
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
            var loadingPromise = loadOfferingsForProduct(product).then(function(){
                vm.expandedProducts[product.id] = true;
            });
            vm.loadingPromise[product.id] = loadingPromise;
        }
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }

    function exportOfferingList(vendor) {
        return offeringService.listOfferingsForVendorId(vendor.id)
            .then(addOfferingsToProducts)
            .then(doOfferingExport);

        function addOfferingsToProducts(offerings) {
            console.log('got ' + offerings.length + ' offerings');
            offerings.forEach(addOfferingToProduct);

            function addOfferingToProduct(offering) {
                vendor.products.forEach(addOfferingIfProductMatches);

                function addOfferingIfProductMatches(product) {
                    if (offering.product.id == product.id) {
                        initializeOfferingsArray();
                        product.offerings.push(offering);
                    }

                    function initializeOfferingsArray() {
                        if (!product.offerings) {
                            product.offerings = [];
                        }
                    }
                }
            }
        }

        function doOfferingExport() {
            return offeringsByVendorExport(vendor, vm.cycle, vm.offeringColumns);
        }
    }
}

angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesByVendorController', carliCheckingPricesByVendorController);

function carliCheckingPricesByVendorController( $scope, $q, alertService, controllerBaseService, cycleService, libraryService, vendorService, offeringService, productService ) {
    var vm = this;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.offeringDisplayLabels = offeringService.getOfferingDisplayLabels();
    vm.loadProductsForVendor = loadProductsForVendor;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.loadingPromise = {};
    vm.setOfferingEditable = setOfferingEditable;
    vm.saveOffering = saveOffering;
    vm.debounceSaveOffering = debounceSaveOffering;
    vm.vendors = [];
    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.offeringColumns = [
        'library',
        'library-view',
        'site-license-price',
        'flag'
    ];

    activate();

    function activate () {
        controllerBaseService.addSortable(vm, 'library.name');

        vm.cycle = cycleService.getCurrentCycle();
        vm.lastYear = vm.cycle.year - 1;

        loadVendors();
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
            return;
        }
        vm.loadingPromise[vendor.id] = productService.listProductsForVendorId(vendor.id).then(function (products) {
            vendor.products = products;

            var promises = [];
            angular.forEach(products, function (product) {
                var offeringPromise = offeringService.listOfferingsForProductId(product.id).then(function(offerings) {
                    product.offerings = offerings;

                    offerings.forEach(function(offering){
                        offering.display = offering.display || "with-price";

                        updateOfferingFlaggedStatus(offering);

                        if (!offering.libraryComments) {
                            offering.libraryComments = offering.product.comments;
                        }
                    });
                    return offerings;
                });
                promises.push(offeringPromise);
            });
            return $q.all(promises);
        });
    }

    function getVendorPricingStatus(vendor) {
        return "No activity";
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }

    function debounceSaveOffering($event, offering, productOfferings) {
        offering.userTouchedFlag = true;
        if (vm.isEditing[offering.id]) {
            return;
        }
        if ($event.target.tagName === 'INPUT') {
            saveOffering( offering, productOfferings );
        }
    }

    function saveOffering( offering, productOfferings ) {
        if (offering.libraryComments === offering.product.comments) {
            delete offering.libraryComments;
        }
        if (!offering.userTouchedFlag) {
            delete offering.flagged;
        }
        delete offering.userTouchedFlag;

        offeringService.update(offering)
            .then(offeringService.load)
            .then(updateOfferingFlaggedStatus)
            .then(function(updatedOffering){
                var offeringIndex = productOfferings.indexOf(offering);
                productOfferings[offeringIndex] = updatedOffering;
                alertService.putAlert('Offering updated', {severity: 'success'});
                vm.isEditing[offering.id] = false;
            }).catch(function(err) {
                alertService.putAlert(err, {severity: 'danger'});
                console.log('failed', err);
            });
    }

    function updateOfferingFlaggedStatus( offering ){
        offering.flagged = offering.getFlaggedState();
        return offering;
    }
}

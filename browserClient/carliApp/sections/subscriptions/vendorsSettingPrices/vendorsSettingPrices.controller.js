angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( $scope, alertService, cycleService, libraryService, vendorService, offeringService, productService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.offeringDisplayLabels = offeringService.getOfferingDisplayLabels();
    vm.loadProductsForVendor = loadProductsForVendor;
    vm.setOfferingEditable = setOfferingEditable;
    vm.saveOffering = saveOffering;
    vm.vendors = [];
    vm.isEditing = {};
    vm.cycle = {};

    activate();

    function activate () {
        initSortable();

        vm.cycle = cycleService.getCurrentCycle();

        libraryService.list()
            .then(initLibraryList)
            .then(loadVendors);
    }

    function initSortable() {
        vm.orderBy = vm.orderBy || 'name';
        vm.reverse = false;

        vm.sort = function sort( newOrderBy ){
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
        };
    }

    function initLibraryList( libraryList ){
        vm.libraryMap = {};

        libraryList.forEach(function(library){
            vm.libraryMap[library.id] = library;
        });
    }

    function loadVendors() {
        vendorService.list().then(function (vendors) {
            vm.vendors = vendors;
            //angular.forEach(vendors, function (vendor) {
            //    loadProductsForVendor(vendor);
            //});
        });
    }

    function loadProductsForVendor(vendor) {
        productService.listProductsForVendorId(vendor.id).then(function (products) {
            vendor.products = products;

            angular.forEach(products, function (product) {
                offeringService.listOfferingsForProductId(product.id).then(function(offerings) {
                    product.offerings = offerings;

                    offerings.forEach(function(offering){
                        offering.display = offering.display || "with-price";
                        /*XXX*/offering.flagged = Math.random() > 0.5;
                        offering.library = vm.libraryMap[offering.library];
                        if (!offering.libraryComments) {
                            offering.libraryComments = offering.product.comments;
                        }
                    });
                });
            });
        });
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }

    function saveOffering( offering ) {
        if (offering.libraryComments === offering.product.comments) {
            delete offering.libraryComments;
        }
        /*
        offeringService.update(offering).then(function(result){
            //alert(?)
            console.log(result);
            vm.isEditing[offering.id] = false;
        }).catch(function(err) {
            console.log('failed', err);
        });
        */
        /*XXX*/vm.isEditing[offering.id] = false;
    }

    function closeVendorPricing(){
        $scope.cycle.returnToPreviousStep();
        //TODO: persist the cycle and add a success alert when it's saved
    }

}

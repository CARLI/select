angular.module('carli.sections.oneTimePurchases')
    .controller('oneTimePurchasesByLibraryController', oneTimePurchasesByLibraryController);

function oneTimePurchasesByLibraryController(config, controllerBaseService, cycleService, libraryService, notificationModalService, vendorService) {
    var vm = this;

    vm.cycle = null;
    vm.filterOfferingBySelection = filterOfferingBySelection;
    vm.invoiceAnnualAccessFees = invoiceAnnualAccessFees;
    vm.libraryList = [];
    vm.libraryListLoadingPromise = null;
    vm.offeringFilter = {};
    vm.vendorMap = {};

    activate();

    function activate() {


        vm.libraryListLoadingPromise = initControllerData();

        return vm.libraryListLoadingPromise;
    }

    function filterOfferingBySelection(offering) {
        if (!offering || !offering.library) {
            return false;
        }
        if (vm.isEditing[offering.id]) {
            return true;
        }
        var libraryId = typeof offering.library === 'string' ? offering.library : offering.library.id;
        var filterStatus = vm.offeringFilter[libraryId] || 'selected';

        if (filterStatus === 'all') {
            return true;
        }
        else if (filterStatus === 'selected' && offering.selection) {
            return true;
        }
        else if (filterStatus === 'unselected' && !offering.selection) {
            return true;
        }
        else {
            return false;
        }
    }

    function initControllerData() {
        return initVendorMap()
            .then(setCycleToOneTimePurchase)
            .then(initLibraryList);

        function setCycleToOneTimePurchase() {
            return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function (oneTimePurchaseCycle) {
                vm.cycle = oneTimePurchaseCycle;
                cycleService.setCurrentCycle(oneTimePurchaseCycle);
                return oneTimePurchaseCycle;
            });
        }

        function initLibraryList() {
            return libraryService.listActiveLibraries().then(function (libraryList) {
                vm.libraryList = libraryList;
            });
        }

        function initVendorMap() {
            return vendorService.list().then(function (vendorList) {
                vendorList.forEach(function (vendor) {
                    vm.vendorMap[vendor.id] = vendor;
                });
                return vm.vendorMap;
            });
        }
    }


    function invoiceAnnualAccessFees() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-annual-access-fee-invoices'
        });
    }

}
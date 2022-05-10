angular.module('carli.sections.oneTimePurchases')
    .controller('oneTimePurchasesByVendorController', oneTimePurchasesByVendorController);

function oneTimePurchasesByVendorController($scope, $timeout, $q, accordionControllerMixin, config, controllerBaseService, cycleService, editOfferingService, notificationModalService, offeringService, offeringsByVendorExport, productService, vendorService, userService) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);
    controllerBaseService.addSortable(vm, 'library.name');

    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.cycle = {};
    vm.expandedProducts = {};
    vm.isEditing = {};
    vm.lastYear = '';
    vm.loadingPromise = {};
    vm.offeringColumns = [
        'library',
        'library-view',
        'site_license_price_only_as_price',
        'selection'
    ];
    vm.selectedOfferings = {};
    vm.vendors = [];

    vm.computeInvoiceTotalForVendor = computeInvoiceTotalForVendor;
    vm.computeSelectionTotalForVendor = computeSelectionTotalForVendor;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.reportAllProductsForVendor = reportAllProductsForVendor;
    vm.reportAllVendors = reportAllVendors;
    vm.reportCheckedProductsForVendor = reportCheckedProductsForVendor;
    vm.stopEditing = stopEditing;
    vm.toggleProductSection = toggleProductSection;

    activate();

    function activate() {
        setCycleToOneTimePurchase();
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
            .then(function (productsByVendorId) {
                return Object.keys(productsByVendorId);
            })
            .then(vendorService.getVendorsById)
            .then(filterActiveVendors)
            .then(function (vendors) {
                vm.vendors = vendors;
            });
    }

    function filterActiveVendors(vendorList) {
        return vendorList.filter(vendorIsActive);

        function vendorIsActive(vendor) {
            return vendor.isActive;
        }
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return $q.when(vendor.products);
        }

        vm.loadingPromise[vendor.id] = productService.listActiveProductsForVendorId(vendor.id)
            .then(function (products) {
                vendor.products = products;
                return products;
            });

        return vm.loadingPromise[vendor.id];
    }

    function loadOfferingsForProduct(product) {
        if (product.offerings) {
            return $q.when(product.offerings);
        }

        return offeringService.listOfferingsForProductId(product.id)
            .then(filterActiveLibraries)
            .then(function (offerings) {
                product.offerings = offerings;
                return offerings;
            });
    }

    function filterActiveLibraries(offeringsList) {
        return offeringsList.filter(function (offering) {
            return offering.library.isActive && offering.library.membershipLevel !== "Affiliate";
        });
    }

    function toggleProductSection(product) {
        if (vm.expandedProducts[product.id]) {
            delete vm.expandedProducts[product.id];
        }
        else {
            vm.loadingPromise[product.id] = loadOfferingsForProduct(product)
                .then(function () {
                    vm.expandedProducts[product.id] = true;
                });
        }
    }

    function updateVendorTotals() {
        vm.selectionTotal = {};
        vm.invoiceTotal = {};

        vm.vendors.forEach(function (vendor) {
            vm.selectionTotal[vendor.id] = computeSelectionTotalForVendor(vendor);
            vm.invoiceTotal[vendor.id] = computeInvoiceTotalForVendor(vendor);
        });
    }

    function computeSelectionTotalForVendor(vendor) {
        if (!vendor.products) {
            return 0;
        }

        var sum = 0;
        var products = vendor.products;
        products.forEach(function (product) {
            var offerings = product.offerings || [];

            offerings.forEach(function (offering) {
                sum += offering.selection ? offeringService.getFullSelectionPrice(offering) : 0;
            });
        });

        return sum;
    }

    function computeInvoiceTotalForVendor(vendor) {
        if (!vendor.products) {
            return 0;
        }

        var sum = 0;
        var products = vendor.products;
        products.forEach(function (product) {
            var offerings = product.offerings || [];

            offerings.forEach(function (offering) {
                if (offering.invoice) {
                    sum += offering.invoice.price ? offering.invoice.price : 0;
                }
            });
        });

        return sum;
    }

    function setCycleToOneTimePurchase() {
        return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function (oneTimePurchaseCycle) {
            vm.cycle = oneTimePurchaseCycle;
            cycleService.setCurrentCycle(oneTimePurchaseCycle);
            return oneTimePurchaseCycle;
        });
    }

    function setOfferingEditable(offering) {
        vm.isEditing[offering.id] = true;
    }

    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
        updateVendorTotals();
        vm.notifyParentOfSave();
    }

    function reportCheckedProductsForVendor(vendor) {
        if (!vendor || !vm.selectedOfferings[vendor.id]) {
            return;
        }

        var offeringsToReport = Object.keys(vm.selectedOfferings[vendor.id]).filter(function (key) {
            return vm.selectedOfferings[vendor.id][key];
        });

        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id,
            offeringIds: offeringsToReport
        });
    }

    function reportAllProductsForVendor(vendor) {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id,
            recipientId: vendor.id
        });
    }

    function reportAllVendors() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id
        });
    }
}
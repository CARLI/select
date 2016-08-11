angular.module('carli.editOffering')
    .controller('editOfferingController', editOfferingController);

function editOfferingController(activityLogService, alertService, cycleService, errorHandler, offeringService, productService) {
    var vm = this;

    vm.cancel = cancel;
    vm.userTouchedFlag = false;

    vm.clearManualFlag = clearManualFlag;
    vm.flagIsManuallySet = flagIsManuallySet;
    vm.saveOffering = saveOffering;
    vm.setOneTimePurchaseInvoicedDate = setOneTimePurchaseInvoicedDate;
    vm.shouldShowColumn = shouldShowColumn;
    vm.shouldShowMarkInvoiced = shouldShowMarkInvoiced;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.userClickedFlag = userClickedFlag;
    vm.getProductDisplayName = productService.getProductDisplayName;

    activate();


    function activate() {
        vm.userTouchedFlag = false;

        offeringService.load(vm.offering.id)
            .then(setupEditorWithLoadedOffering);

        function setupEditorWithLoadedOffering(offering) {
            workaroundCouchStoreRevisionSmell(offering);
            initializeManualFlagStateToDefaultFlagState();
        }
    }

    function cancel() {
        //Sadly, this isn't quite good enough, since the editOffering form directly edits the offering object that is
        //linked directly to the actual list. We'd need to remember the initial state on activate and then restore it.
        vm.notifyParentOfSave(vm.offering);
    }

    function saveOffering() {
        var tempLibraryComments = "an arbitrary string that is very unlikely to be an actual product comment";
        if (vm.offering.libraryComments === vm.offering.product.comments) {
            tempLibraryComments = vm.offering.product.comments;
            delete vm.offering.libraryComments;
        }
        if (vm.userTouchedFlag) {
            vm.offering.flagged = vm.manualFlag;
            vm.userTouchedFlag = false;
        }

        if ('selection' in vm.offering && typeof vm.offering.selection === 'undefined') {
            delete vm.offering.selection;
        }

        keepValidSuPricingRows();

        return offeringService.update(vm.offering)
            .then(offeringService.load)
            .then(function (updatedOffering) {
                workaroundCouchStoreRevisionSmell(updatedOffering);
                alertService.putAlert('Offering updated', {severity: 'success'});
                vm.notifyParentOfSave(vm.offering);
                return logUpdateActivity();
            })
            .then(syncData)
            .then(replaceLibraryCommentsIfRemoved)
            .catch(errorHandler);

        function replaceLibraryCommentsIfRemoved() {
            if (tempLibraryComments === vm.offering.product.comments) {
                vm.offering.libraryComments = tempLibraryComments;
            }
        }

        function syncData() {
            return cycleService.syncDataToVendorDatabase(vm.offering.vendorId);
        }

        function keepValidSuPricingRows() {
            var newSuPricing = [];

            for (var i in vm.offering.pricing.su) {
                var pricingRow = vm.offering.pricing.su[i];
                if (pricingRow.price && pricingRow.users) {
                    newSuPricing.push(vm.offering.pricing.su[i]);
                }
            }

            vm.offering.pricing.su = newSuPricing;
        }
    }

    function workaroundCouchStoreRevisionSmell(offering) {
        vm.offering._rev = offering._rev;
    }

    function shouldShowColumn(columnName) {
        return vm.columns.indexOf(columnName) !== -1;
    }

    function shouldShowMarkInvoiced(offering) {
        return shouldShowColumn('oneTimePurchaseSelection') && offerIsSelected(offering);
    }

    function offerIsSelected(offering) {
        if (offering.hasOwnProperty('selection')) {
            return true;
        }
        return false;
    }

    function userClickedFlag() {
        vm.userTouchedFlag = true;
    }

    function clearManualFlag() {
        delete vm.offering.flagged;
        delete vm.manualFlag;
        vm.userTouchedFlag = false;
    }

    function flagIsManuallySet() {
        return typeof vm.offering.flagged !== 'undefined' || vm.userTouchedFlag;
    }

    function offeringFlaggedState() {
        return offeringService.getFlaggedState(vm.offering, vm.cycle);
    }

    function initializeManualFlagStateToDefaultFlagState() {
        vm.manualFlag = offeringFlaggedState();
    }

    function logUpdateActivity() {
        return activityLogService.logOfferingModified(vm.offering, vm.cycle);
    }

    function setOneTimePurchaseInvoicedDate() {
        vm.offering.oneTimePurchaseInvoicedDate = new Date().toISOString();
    }
}

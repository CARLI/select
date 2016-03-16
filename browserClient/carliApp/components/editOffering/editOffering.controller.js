angular.module('carli.editOffering')
    .controller('editOfferingController', editOfferingController);

function editOfferingController(activityLogService, alertService, cycleService, errorHandler, offeringService, productService) {
    var vm = this;
    vm.cancel = cancel;
    vm.saveOffering = saveOffering;
    vm.shouldShowColumn = shouldShowColumn;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.userClickedFlag = userClickedFlag;
    vm.getProductDisplayName = productService.getProductDisplayName;

    var userTouchedFlag = false;

    activate();


    function activate() {
        offeringService.load(vm.offering.id)
            .then(workaroundCouchStoreRevisionSmell);
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
        if (!userTouchedFlag) {
            delete vm.offering.flagged;
        }
        userTouchedFlag = false;

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

    function userClickedFlag() {
        userTouchedFlag = true;
    }

    function logUpdateActivity() {
        return activityLogService.logOfferingModified(vm.offering, vm.cycle);
    }
}
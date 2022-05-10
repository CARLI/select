angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableController', productsAvailableController);

function productsAvailableController( $q, alertService, bannerService, cycleService, userService ) {
    var vm = this;
    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.undoCloseSystem = undoCloseSystem;
    vm.showAvailableBannerExports = showAvailableBannerExports;
    vm.downloadBannerExportForBatchId = downloadBannerExportForBatchId;
    vm.updateSelectionAndInvoiceTotals = updateSelectionAndInvoiceTotals;

    activate();

    function activate() {
        updateSelectionAndInvoiceTotals();
    }

    function updateSelectionAndInvoiceTotals(){
        vm.cycle.getCycleSelectionAndInvoiceTotals().then(function (cycleTotals) {
           vm.cycleTotals = cycleTotals;
        });
    }

    function undoCloseSystem(){
        return vm.cycleRouter.previous();
    }

    function showAvailableBannerExports() {
        return bannerService.listBatchesForCycle(vm.cycle)
            .then(function (batches) {
                vm.bannerExportBatches = batches;
                $('#banner-export-modal').modal('show');
            });
    }

    function downloadBannerExportForBatchId(batchId) {
        return bannerService.downloadBannerExportForInvoices(vm.cycle, batchId)
            .catch(showError);

        function showError(err) {
            alertService.putAlert(err.message, { severity: 'danger' });
        }
    }
}

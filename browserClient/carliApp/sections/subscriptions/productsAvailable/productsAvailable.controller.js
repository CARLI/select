angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableController', productsAvailableController);

function productsAvailableController( $q, alertService, bannerService, cycleService ) {
    var vm = this;
    vm.undoCloseSystem = undoCloseSystem;
    vm.showAvailableBannerExports = showAvailableBannerExports;

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
}

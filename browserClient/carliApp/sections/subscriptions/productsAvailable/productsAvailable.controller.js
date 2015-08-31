angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableController', productsAvailableController);

function productsAvailableController( $q, alertService, cycleService ) {
    var vm = this;
    vm.undoCloseSystem = undoCloseSystem;
    //vm.exportForBanner = exportForBanner;

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

    //function exportForBanner() {
    //    // There can be any number of banner exports for a cycle.
    //    // This needs to be replaced with another prompt that shows the user all of the
    //    // invoice batches that have been generated so they can pick which batch they want the feed for.
    //    var batchId = 'USI000000';
    //    return cycleService.getDataForBannerExport(vm.cycle, batchId)
    //        .then(function(data) {
    //            console.log(data);
    //        })
    //        .catch(function (error) {
    //            alertService.putAlert(error.message, { severity: 'error' });
    //            console.log(error);
    //        });
    //}
}

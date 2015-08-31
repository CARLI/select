angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableController', productsAvailableController);

function productsAvailableController( $q, alertService, cycleService ) {
    var vm = this;
    vm.undoCloseSystem = undoCloseSystem;
    vm.exportForBanner = exportForBanner;

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

    function exportForBanner() {
        return cycleService.getDataForBannerExport(vm.cycle)
            .then(function(data) {
                console.log(data);
            })
            .catch(function (error) {
                alertService.putAlert(error.message, { severity: 'error' });
                console.log(error);
            });
    }
}

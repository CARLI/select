angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableController', productsAvailableController);

function productsAvailableController( $q, alertService ) {
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
        return vm.cycle.exportForBanner();
    }
}

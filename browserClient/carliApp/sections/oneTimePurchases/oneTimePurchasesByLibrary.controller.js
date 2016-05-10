angular.module('carli.sections.oneTimePurchases')
    .controller('oneTimePurchasesByLibraryController', oneTimePurchasesByLibraryController);

function oneTimePurchasesByLibraryController() {
    var vm = this;

    vm.invoiceAnnualAccessFees = invoiceAnnualAccessFees;

    activate();

    function activate() {
        console.log('oneTimePurchasesByLibraryController activate');
    }

    function invoiceAnnualAccessFees() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-annual-access-fee-invoices'
        });
    }

}
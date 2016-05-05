angular.module('carli.sections.oneTimePurchases')
    .controller('oneTimePurchasesByVendorController', oneTimePurchasesByVendorController);

function oneTimePurchasesByVendorController() {
    var vm = this;

    activate();

    function activate() {
        console.log('oneTimePurchasesByVendorController activate');
    }
}
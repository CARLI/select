angular.module('carli.sections.oneTimePurchases')
    .controller('oneTimePurchasesByLibraryController', oneTimePurchasesByLibraryController);

function oneTimePurchasesByLibraryController() {
    var vm = this;

    activate();

    function activate() {
        console.log('oneTimePurchasesByLibraryController activate');
    }
}
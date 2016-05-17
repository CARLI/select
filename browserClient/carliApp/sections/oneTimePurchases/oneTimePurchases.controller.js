angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController(){
    var vm = this;

    vm.groupBy = 'library';

    vm.offeringUpdated = offeringUpdated;

    activate();

    function activate() {
    }

    function offeringUpdated() {
        console.log('a child offering was updated');
    }
}

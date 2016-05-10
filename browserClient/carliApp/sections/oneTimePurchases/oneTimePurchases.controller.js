angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController(){
    var vm = this;

    vm.groupBy = 'library';

    activate();

    function activate() {
    }
}

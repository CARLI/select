angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController( $sce, notificationModalService, libraryService ){
    var vm = this;

    vm.groupBy = 'library';

    activate();


    function activate() {
        console.log('oneTimePurchasesController activate');
    }
}

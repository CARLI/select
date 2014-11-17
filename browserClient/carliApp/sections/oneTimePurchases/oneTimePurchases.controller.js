angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController( libraryService ){
    var vm = this;

    activate();

    function activate() {
        libraryService.list().then( function(libraryList){
            vm.libraryList = libraryList;
        });
    }
}

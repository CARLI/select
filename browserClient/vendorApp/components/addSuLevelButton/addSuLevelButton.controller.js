angular.module('vendor.addSuLevelButton')
    .controller('addSuLevelButtonController', addSuLevelButtonController);

function addSuLevelButtonController(){
    var vm = this;

    vm.numberOfUsers = 1;

    vm.addSuPrice = addSuPrice;

    function addSuPrice(){
        return vm.addSuPricingLevel( vm.numberOfUsers );
    }
}
angular.module('vendor.addSuLevelButton')
    .controller('addSuLevelButtonController', addSuLevelButtonController);

function addSuLevelButtonController(){
    var vm = this;

    vm.numberOfUsers = vm.nextSuLevel() || 1;

    vm.addSuPrice = addSuPrice;

    function addSuPrice(){
        return vm.addSuPricingLevel( vm.numberOfUsers );
    }
}
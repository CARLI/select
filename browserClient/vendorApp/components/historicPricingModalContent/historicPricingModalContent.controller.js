angular.module('vendor.historicPricingModalContent')
    .controller('historicPricingModalContentController', historicPricingModalContentController);

function historicPricingModalContentController(){
    var vm = this;

    activate();

    function activate(){
        vm.lastYear = vm.thisYear - 1;
    }
}
angular.module('vendor.historicPricingModalContent')
    .controller('historicPricingModalContentController', historicPricingModalContentController);

function historicPricingModalContentController(){
    var vm = this;

    activate();

    function activate(){
        console.log('activate historicPricingModalContent');
        vm.lastYear = vm.currentYear - 1;
    }
}
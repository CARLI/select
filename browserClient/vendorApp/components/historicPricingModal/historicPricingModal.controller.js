angular.module('vendor.historicPricingModal')
    .controller('historicPricingModalController', historicPricingModalController);

function historicPricingModalController(){
    var vm = this;

    activate();

    function activate(){
        vm.lastYear = vm.currentYear - 1;
    }
}
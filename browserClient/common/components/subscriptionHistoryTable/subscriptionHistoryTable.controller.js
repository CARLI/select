angular.module('common.subscriptionHistoryTable')
    .controller('subscriptionHistoryTableController', subscriptionHistoryTableController);

function subscriptionHistoryTableController(historicalPricingService){
    var vm = this;

    vm.loadingPromise = null;
    vm.orderBy = 'year';
    vm.reverse = true;
    vm.rows = [];
    vm.yearLabel = 'Year';

    activate();

    function activate(){
        if ( vm.library ){
            vm.yearLabel = 'Your History';
        }

        vm.loadingPromise = historicalPricingService.getHistoricalPricingDataForProduct(vm.product.id, vm.cycle)
            .then(function(historicalPricingData){
                vm.rows = historicalPricingData;
            });
    }
}
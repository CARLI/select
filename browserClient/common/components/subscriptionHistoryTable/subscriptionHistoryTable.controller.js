angular.module('common.subscriptionHistoryTable')
    .controller('subscriptionHistoryTableController', subscriptionHistoryTableController);

function subscriptionHistoryTableController(config, cycleService, historicalPricingService){
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

        vm.loadingPromise = loadDataForTemplate();
    }

    function loadDataForTemplate(){
        if ( vm.library ){
            return getHistoricalPricingAndSelectionData();
        }
        else {
            return getHistoricalPricingDataOnly();
        }
    }

    function getHistoricalPricingAndSelectionData(){
        return getHistoricalPricingData()
            .then(addSelectionData)
            .then(saveHistoricPricingDataToVm);
    }

    function getHistoricalPricingDataOnly(){
        return getHistoricalPricingData()
            .then(checkForOneTimePurchase)
            .then(saveHistoricPricingDataToVm);
    }

    function getHistoricalPricingData(){
        return historicalPricingService.getHistoricalPricingDataForProduct(vm.product.id, vm.cycle);
    }

    function addSelectionData(historicPricingData){
        return getSelectionDataForLibrary()
            .then(function(historicSelectionData){
                return historicPricingData.map(addSelectionDataToPricingData);

                function addSelectionDataToPricingData(historicPricingEntry){
                    historicPricingEntry.selected = historicSelectionData[historicPricingEntry.year];
                    return historicPricingEntry;
                }
            });
    }

    function getSelectionDataForLibrary(){
        return cycleService.getHistoricalSelectionDataForProductForCycle(vm.product.id, vm.cycle);
    }

    function saveHistoricPricingDataToVm(historicPricingData){
        vm.rows = historicPricingData;
        return historicPricingData;
    }

    function checkForOneTimePurchase(historicPricingData){
        if ( vm.cycle.id === config.oneTimePurchaseProductsCycleDocId ){
            historicPricingData[0].year = 'Total Subscribers';
            delete historicPricingData[0].current;
            vm.yearLabel = '';
        }
        return historicPricingData;
    }

}
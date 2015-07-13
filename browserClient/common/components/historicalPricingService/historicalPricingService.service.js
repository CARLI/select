angular.module('common.historicalPricingService')
    .service('historicalPricingService', historicalPricingService);

function historicalPricingService($q, cycleService, productService, errorHandler){

    return {
        getHistoricalPricingDataForProduct: getHistoricalPricingDataForProduct
    };

    function getHistoricalPricingDataForProduct( productId, cycle ){
        var currentCycle = cycle || cycleService.getCurrentCycle();

        return cycleService.listPastFourCyclesMatchingCycle(currentCycle)
            .then(setupDataForTable)
            .catch(errorHandler);


        function setupDataForTable( pastCycles ){
            var cycleList = pastCycles.concat(currentCycle);

            return $q.all( cycleList.map(loadProductStatsForCycle) );

            function loadProductStatsForCycle(cycle){
                return productService.getProductSelectionStatisticsForCycle(productId, cycle)
                    .then(makeDataTableEntry);

                function makeDataTableEntry(productStatistics){
                    return {
                        year: cycle.year,
                        subscribers: subscriberCount(),
                        current: (cycle.id === currentCycle.id ? 'current' : '')
                    };

                    function subscriberCount(){
                        var notOffered = '-';

                        if ( productStatistics.numberOffered > 0 ){
                            return productStatistics.numberSelected;
                        }
                        else {
                            return notOffered;
                        }
                    }
                }
            }
        }
    }
}

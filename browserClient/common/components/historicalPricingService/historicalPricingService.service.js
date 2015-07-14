angular.module('common.historicalPricingService')
    .service('historicalPricingService', historicalPricingService);

function historicalPricingService($q, cycleService, productService, errorHandler){

    return {
        getHistoricalPricingDataForProduct: getHistoricalPricingDataForProduct
    };

    function getHistoricalPricingDataForProduct( productId, cycle ){
        var currentCycle = cycle || cycleService.getCurrentCycle();
        
        return cycleService.listPastFourCyclesMatchingCycle(currentCycle)
            .then(getHistoricalPricingForPastCycles)
            .catch(errorHandler);


        function getHistoricalPricingForPastCycles( pastCycles ){
            var cycleList = pastCycles.concat(currentCycle);

            return $q.all( cycleList.map(loadProductStatsForCycle) );

            function loadProductStatsForCycle(cycle){
                return productService.getProductSelectionStatisticsForCycle(productId, cycle)
                    .then(makeDataTableEntry);

                function makeDataTableEntry(productStatistics){
                    return {
                        current: (cycle.id === currentCycle.id ? 'current' : ''),
                        description: productOfferingDescription(),
                        subscribers: subscriberCount(),
                        year: cycle.year,
                        minPrice : productStatistics.minPrice,
                        maxPrice: productStatistics.maxPrice
                    };

                    function productOfferingDescription(){
                        if ( productStatistics.numberOffered > 0 && productStatistics.numberSelected > 0 ){
                            return 'selected';
                        }
                        else if ( productStatistics.numberOffered > 0 ){
                            return 'not selected';
                        }
                        else {
                            return 'not offered';
                        }
                    }

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

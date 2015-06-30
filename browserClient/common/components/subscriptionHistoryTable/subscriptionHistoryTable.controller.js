angular.module('common.subscriptionHistoryTable')
    .controller('subscriptionHistoryTableController', subscriptionHistoryTableController);

function subscriptionHistoryTableController($q, cycleService, productService){
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

        vm.loadingPromise = cycleService.listPastFourCyclesMatchingCycle(vm.cycle)
            .then(setupDataForTable)
            .catch(function(err){
                //console.log('Error loading data for subscriptionHistoryTable',err);
            });
    }

    function setupDataForTable( pastCycles ){
        var currentCycle = vm.cycle || cycleService.getCurrentCycle();

        var cycleList = pastCycles.concat(currentCycle);

        return $q.all( cycleList.map(loadProductStatsAndMakeRowForCycle) )
            .then(function(results){
                vm.rows = results;
            });

        function loadProductStatsAndMakeRowForCycle(cycle){
            return productService.getProductSelectionStatisticsForCycle(vm.product.id, cycle)
                .then(makeRow);

            function makeRow(stats){
                return {
                    year: cycle.year,
                    subscribers: subscriberCount(),
                    current: (cycle.id === vm.cycle.id ? 'current' : '')
                };

                function subscriberCount(){
                    var notOffered = '-';
                    
                    if ( stats.numberOffered > 0 ){
                        return stats.numberSelected;
                    }
                    else {
                        return notOffered;
                    }
                }
            }
        }
    }
}
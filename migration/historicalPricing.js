var CycleRepository = require('../CARLI').Cycle;
var CouchDbStore = require('../CARLI').CouchDbStore;
var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
CycleRepository.setStore(Store(CouchDbStore(StoreOptions)));

function populateHistoricalPricingForCycle( cycleId ){
    return CycleRepository.load(cycleId)
        .then(listPastCyclesOfSameTypeAsCycle)
        .then(function(matchingCycles){

            console.log('Found '+matchingCycles.length+' cycles to copy history from');
            matchingCycles.forEach(function(cycle){
                console.log('  '+cycle.name);
            });
        });
}

function listPastCyclesOfSameTypeAsCycle( cycle ){
    var type = cycle.cycleType;
    var year = cycle.year;

    return CycleRepository.list()
        .then(filterCyclesPreviousMatchingType);

    function filterCyclesPreviousMatchingType( cycleList ){
        return cycleList.filter(function(cycleToFilter){
            return cycleToFilter.cycleType === type && cycleToFilter.year < year;
        });
    }
}

module.exports = {
    populateHistoricalPricingForCycle: populateHistoricalPricingForCycle
};
var CycleRepository = require('../CARLI').Cycle;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
CycleRepository.setStore(Store(CouchDbStore(StoreOptions)));

var cyclesToMigrate = [
    {
        idalId: 200,
        name: 'Calendar Year 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    //},
    //{
    //    idalId: 190,
    //    name: 'Fiscal Year 2014',
    //    cycleType: 'Fiscal Year',
    //    year: 2014,
    //    status: 4,
    //    isArchived: false,
    //    startDateForSelections: '2013-04-22',
    //    endDateForSelections: '2013-05-31',
    //    productsAvailableDate: '2014-07-01'
    }
];

function migrateCycles(connection) {
    var resultsPromise = Q.defer();

    createCycles(cyclesToMigrate).then(function(idMap){
        resultsPromise.resolve(idMap);
    });

    return resultsPromise.promise;
}

function createCycles(cycles) {
    var idalIdsToCouchIds = {};
    var extractCyclesPromises = [];
    var resultsPromise = Q.defer();

    for (var i in cycles) {
        var createCyclePromise = createCycle(cycles[i]);

        extractCyclesPromises.push(createCyclePromise);

        createCyclePromise.then(function(resultObj){
            idalIdsToCouchIds[resultObj.idalLegacyId] = resultObj.couchId;
        });
    }

    Q.all(extractCyclesPromises).then(function(){
        resultsPromise.resolve(idalIdsToCouchIds);
    });

    return resultsPromise.promise;
}

function createCycle(cycle){
    console.log('creating: ' + cycle.name);

    var couchIdPromise = Q.defer();

    CycleRepository.create( cycle )
        .then(function(id) {
            couchIdPromise.resolve({
                couchId: id,
                idalLegacyId: cycle.idalId
            });
        })
        .catch(function(err) {
            console.log(err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

module.exports = {
    migrateCycles: migrateCycles
};

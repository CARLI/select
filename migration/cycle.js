var CycleRepository = require('../CARLI').Cycle;
var CouchDbStore = require('../CARLI').CouchDbStore;
var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
CycleRepository.setStore(Store(CouchDbStore(StoreOptions)));

var cyclesToMigrate = [
    {
        id: 'one-time-purchase-products-cycle',
        idalId: 100,
        databaseName: 'cycle-one-time-purchase-products',
        name: 'One Time Purchases',
        cycleType: 'One-Time Purchase',
        year: 0,
        status: 5,
        isArchived: false
    },
    {
        idalId: 110,
        name: 'Fiscal Year 2010',
        cycleType: 'Fiscal Year',
        year: 2010,
        status: 6,
        isArchived: true
    },
    {
        idalId: 120,
        name: 'Calendar Year 2010',
        cycleType: 'Calendar Year',
        year: 2010,
        status: 6,
        isArchived: true
    },
    {
        idalId: 130,
        name: 'Fiscal Year 2011',
        cycleType: 'Fiscal Year',
        year: 2011,
        status: 6,
        isArchived: true
    },
    {
        idalId: 140,
        name: 'Calendar Year 2011',
        cycleType: 'Calendar Year',
        year: 2011,
        status: 6,
        isArchived: true
    },
    {
        idalId: 150,
        name: 'Fiscal Year 2012',
        cycleType: 'Fiscal Year',
        year: 2012,
        status: 6,
        isArchived: true
    },
    {
        idalId: 160,
        name: 'Calendar Year 2012',
        cycleType: 'Calendar Year',
        year: 2012,
        status: 6,
        isArchived: true
    },
    {
        idalId: 170,
        name: 'Fiscal Year 2013',
        cycleType: 'Fiscal Year',
        year: 2013,
        status: 6,
        isArchived: true
    },
    {
        idalId: 180,
        name: 'Calendar Year 2013',
        cycleType: 'Calendar Year',
        year: 2013,
        status: 6,
        isArchived: true
    },
    {
        idalId: 190,
        name: 'Fiscal Year 2014',
        cycleType: 'Fiscal Year',
        year: 2014,
        status: 6,
        isArchived: true,
        startDateForSelections: '2013-04-22',
        endDateForSelections: '2013-05-31',
        productsAvailableDate: '2014-07-01'
    },
    {
        idalId: 200,
        name: 'Calendar Year 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 6,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    },
    {
        idalId: 210,
        name: 'Fiscal Year 2015',
        cycleType: 'Fiscal Year',
        year: 2015,
        status: 5,
        isArchived: false,
        startDateForSelections: '2014-04-15',
        endDateForSelections: '2014-05-30',
        productsAvailableDate: '2015-07-01'
    },
    {
        idalId: 220,
        name: 'Calendar Year 2015',
        cycleType: 'Calendar Year',
        year: 2015,
        status: 5,
        isArchived: false,
        startDateForSelections: '2014-10-14',
        endDateForSelections: '2014-11-14',
        productsAvailableDate: '2015-01-01'
    },
    {
        idalId: 230,
        name: 'Fiscal Year 2016',
        cycleType: 'Calendar Year',
        year: 2016,
        status: 5,
        isArchived: false,
        startDateForSelections: '2015-04-08',
        endDateForSelections: '2015-05-15',
        productsAvailableDate: '2016-07-01'
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
    console.log('  creating cycle: ' + cycle.name);

    var couchIdPromise = Q.defer();

    CycleRepository.create( cycle, couchUtils.DB_TYPE_STAFF )
        .then(function(id) {
            couchIdPromise.resolve({
                couchId: id,
                idalLegacyId: cycle.idalId
            });
        })
        .catch(function(err) {
            console.log('Error creating cycle:', err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

module.exports = {
    migrateCycles: migrateCycles
};

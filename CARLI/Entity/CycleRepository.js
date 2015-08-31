var Entity = require('../Entity')
    , EntityTransform = require('./EntityTransformationUtils')
    , carliError = require('../Error')
    , config = require('../../config')
    , couchUtils = require('../Store/CouchDb/Utils')()
    , LibraryRepository = require('./LibraryRepository')
    , moment = require('moment')
    , NotificationRepository = require('./NotificationRepository')
    , StoreOptions = config.storeOptions
    , Store = require('../Store')
    , StoreModule = require('../Store/CouchDb/Store')
    , Q = require('q')
    , _ = require('lodash')
    ;

var CycleRepository = Entity('Cycle');

CycleRepository.setStore( Store( StoreModule(StoreOptions) ) );

var statusLabels = [
    "Cycle Data Processing",
    "CARLI Editing Product List",
    "Vendor Pricing in Progress",
    "CARLI Checking Prices",
    "Libraries Selecting Products",
    "Selections Made",
    "Archived"
];
var propertiesToTransform = [];

function expandCycles(result) {
    return EntityTransform.expandListOfObjectsFromPersistence(result, propertiesToTransform, functionsToAdd);
}

function transformFunction( cycle ){
    EntityTransform.transformObjectForPersistence(cycle, propertiesToTransform);
}

function createCycleLog(msg, data) {
    var timestamp = new Date().toISOString();
    var prefix = timestamp + ' [Cycle Creation]: ';
    if (data) {
        console.log(prefix + msg, data);
    } else {
        console.log(prefix + msg);
    }
}

function createCycle( cycle, databaseType ) {
    return CycleRepository.create(cycle, transformFunction)
        .then(loadCycle)
        .then(createDatabaseForCycle);

    function createDatabaseForCycle( cycle ) {
        cycle.databaseName = couchUtils.makeValidCouchDbName('cycle-' + cycle.name);
        createCycleLog('Creating database for ' + cycle.name + ' with database ' + cycle.getDatabaseName());

        return couchUtils.createDatabase(cycle.getDatabaseName(), databaseType)
            .then(function commit() {
                createCycleLog('  Success creating database for ' + cycle.name);
                return updateCycle( cycle );
            })
            .catch(function rollback(err) {
                createCycleLog('  Failed to create database for ' + cycle.name);
                CycleRepository.delete( cycle.id );
                throw new Error('createDatabase failed: ' + err);
            });
    }
}

function updateCycle( cycle ){
    return CycleRepository.update( cycle, transformFunction );
}

function listCycles(){
    return expandCycles( CycleRepository.list() );
}

function loadCycle( cycleId ){
    var deferred = Q.defer();

    CycleRepository.load( cycleId )
        .then(function (cycle) {
            EntityTransform.expandObjectFromPersistence( cycle, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(cycle);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(cycle);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listActiveCycles() {
    return expandCycles( couchUtils.getCouchViewResultValues(config.getDbName(), 'listActiveCycles') );
}

function listPastFourCyclesMatchingCycle( cycle ){
    return listCycles()
        .then(filterPreviousCyclesMatchingType);

    function filterPreviousCyclesMatchingType( cycleList ){
        var pastCyclesOfType = cycleList.filter(function(cycleToFilter){
            return cycleToFilter.cycleType === cycle.cycleType && cycleToFilter.year < cycle.year;
        });

        if ( pastCyclesOfType.length > 4 ){
            return pastCyclesOfType.slice(0,4);
        }
        else {
            return pastCyclesOfType;
        }
    }
}

function getDataForBannerExport(cycle, batchId) {
    var librariesById = {};
    var batchId = 'USI00002';

    return LibraryRepository.listActiveLibraries()
        .then(groupLibrariesById)
        .then(loadInvoiceNotifications)
        .then(groupDataByBatchId)
        .then(formatBatchAsBannerFeed);

    function groupLibrariesById(libraries) {
        libraries.forEach(function (library) {
            librariesById[library.id] = library;
        });
        return true;
    }

    function loadInvoiceNotifications() {
        return NotificationRepository.listInvoiceNotificationsForCycleId(cycle.id);
    }

    function groupDataByBatchId(notifications) {
        var dataByBatch = {};
        var seenLibraries = {};
        var seenInvoiceNumbers = {};

        notifications.forEach(groupByBatch);

        return dataByBatch;

        function groupByBatch(notification) {
            if (notification.batchId != batchId) {
                return;
            }

            if ( ! dataByBatch.hasOwnProperty(notification.batchId) ) {
                dataByBatch[notification.batchId] = [];
            }

            throwIfDuplicateLibraries(notification);
            throwIfDuplicateInvoiceNumber(notification);

            var bannerFeedData = {
                batchId: notification.batchId,
                date: notification.dateCreated,
                library: librariesById[notification.targetEntity],
                dollarAmount: notification.summaryTotal,
                invoiceNumber: notification.invoiceNumber
            };

            dataByBatch[notification.batchId].push(bannerFeedData);
        }

        function throwIfDuplicateLibraries(notification) {
            if (seenLibraries.hasOwnProperty(notification.targetEntity)) {
                throw carliError('A library should not appear twice in a single batch');
            } else {
                seenLibraries[notification.targetEntity] = true;
            }
        }

        function throwIfDuplicateInvoiceNumber(notification) {
            if (seenInvoiceNumbers.hasOwnProperty(notification.targetEntity)) {
                throw carliError('An invoice number should not appear twice in a single batch');
            } else {
                seenInvoiceNumbers[notification.targetEntity] = true;
            }
        }
    }

    function formatBatchAsBannerFeed(batches) {
        return formatBatch(batchId, batches[batchId]);
    }

    function formatBatch(batchId, batch) {
        var lines = [];
        var bannerHeaderIndicator = '1';
        var bannerRecordIndicator = '2';
        var carliDepartmentIdentifierForHeader = padRight('9CARLI', 8, ' ');
        var carliDepartmentIdentifierForRecord = padRight('9CARLI', 30, ' ');
        var detailCode = 'USIJ';
        var dollarAmountFieldWidth = 12;

        var twoSpaces = padRight('', 2, ' ');
        var sixSpaces = padRight('', 6, ' ');
        var eightSpaces = padRight('', 8, ' ');
        var nineSpaces = padRight('', 9, ' ');

        var effectiveDate = eightSpaces;
        var billDate = eightSpaces;
        var dueDate = eightSpaces;
        var tnumPaid = eightSpaces;
        var entityCode = twoSpaces;
        var notes = padRight('', 20, ' ');
        var transDate = eightSpaces;

        var totalDollars = 0;
        batch.forEach(function (invoiceData) {
            totalDollars += invoiceData.dollarAmount;
            lines.push(generateBannerRow(invoiceData));
        });

        lines.unshift(generateBannerHeader());
        return lines.join("\n");

        function generateBannerRow(invoiceData) {
            if (!invoiceData.library.gar) {
                throw carliError('Cannot generate banner feed for a library with no GAR (' + invoiceData.library.name + ')');
            }
            return [
                bannerRecordIndicator,
                batchId,
                invoiceData.library.gar,
                nineSpaces,
                carliDepartmentIdentifierForRecord,
                detailCode,
                formatDollarAmountWithLeftPadding(invoiceData.dollarAmount),
                sixSpaces,
                twoSpaces,
                twoSpaces,
                invoiceData.invoiceNumber,
                effectiveDate,
                billDate,
                dueDate,
                tnumPaid,
                entityCode,
                notes,
                transDate
            ].join('');
        }

        function generateBannerHeader() {
            return [
                bannerHeaderIndicator,
                batchId,
                formatBatchCreateDate(),
                padLeft(batch.length, 5, '0'),
                formatDollarAmountWithLeftPadding(totalDollars),
                carliDepartmentIdentifierForHeader
            ].join('');
        }

        function padRight(str, width, char) {
            for (var i = str.length; i < width; i++) {
                str += char;
            }
            return str;
        }

        function padLeft(str, width, char) {
            str = str.toString();
            for (var i = str.length; i < width; i++) {
                str = char + str;
            }
            return str;
        }

        function formatBatchCreateDate() {
            var d = new Date();
            var mm = d.getMonth();
            var dd = d.getDate();

            if (mm < 10) {
                mm = '0' + mm;
            }
            if (dd < 10) {
                dd = '0' + dd;
            }

            return '' + mm + dd + d.getFullYear();
        }

        function formatDollarAmountWithLeftPadding(amount) {
            var formatted = '' + amount.toFixed(2);
            while (formatted.length < dollarAmountFieldWidth) {
                formatted = '0' + formatted;
            }
            return formatted;
        }
    }
}

/* functions that get added as instance methods on loaded Cycles */

var functionsToAdd = {
    getStatusLabel: function () {
        return this.isArchived ? 'Archived' : statusLabels[this.status];
    },
    proceedToNextStep: function() {
        if (this.status < statusLabels.length - 1){
            ++this.status;
        }
    },
    returnToPreviousStep: function() {
        if (this.status > 0){
            --this.status;
        }
    },
    getDatabaseName: function() {
        return this.databaseName;
    },
    getCycleSelectionAndInvoiceTotals: function getCycleSelectionAndInvoiceTotals() {
        return couchUtils.getCouchViewResultValues(this.getDatabaseName(), 'getCycleSelectionAndInvoiceTotals').then(function(resultArray){
            return resultArray[0];
        });
    },
    isOpenToLibraries: function(){
        return isOpenToLibraries(this);
    },
    isClosed: function(){
        return isClosed(this);
    },
    productsAreAvailable: function(){
        return productsAreAvailable(this);
    }
};

function setStore(store) {
    CycleRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

function isOpenToLibraries( cycle ){
    return cycle.status === statusLabels.indexOf("Libraries Selecting Products");
}

function isClosed( cycle ){
    return cycle.status === statusLabels.indexOf("Selections Made");
}

function productsAreAvailable( cycle ){
    return moment().isAfter(cycle.productsAvailableDate);
}

module.exports = {
    setStore: setStore,
    create: createCycle,
    createCycleLog: createCycleLog,
    update: updateCycle,
    list: listCycles,
    load: loadCycle,
    statusLabels: statusLabels,
    listActiveCycles: listActiveCycles,
    isOpenToLibraries: isOpenToLibraries,
    isClosed: isClosed,
    productsAreAvailable: productsAreAvailable,
    listPastFourCyclesMatchingCycle: listPastFourCyclesMatchingCycle,
    getDataForBannerExport: getDataForBannerExport
};

var _ = require('lodash');
var Q = require('q');

var carliError = require('./Error');
var LibraryRepository = require('./Entity/LibraryRepository');
var membershipRepository = require('./Entity/MembershipRepository');
var NotificationRepository = require('./Entity/NotificationRepository');
var OfferingRepository = require('./Entity/OfferingRepository');

function getDataForBannerExportForSubscriptionCycle(cycle, batchId, formatter) {
    var librariesById = {};

    return LibraryRepository.listActiveLibraries()
        .then(filterLibraries)
        .then(groupLibrariesById)
        .then(loadInvoiceNotifications)
        .then(getDataForBatchId)
        .then(collapseDataByDetailCode)
        .then(formatBatchAsBannerFeed);

    function filterLibraries(libraries) {
        return libraries.filter(shouldAppearInBannerFeed);
    }

    function groupLibrariesById(libraries) {
        libraries.forEach(function (library) {
            librariesById[library.id] = library;
        });
        return true;
    }

    function loadInvoiceNotifications() {
        return NotificationRepository.listInvoiceNotificationsForCycleId(cycle.id);
    }

    function getDataForBatchId(notifications) {
        var seenLibraries = {};
        var seenInvoiceNumbers = {};
        var offeringPromises = [];
        var dataForBatch = {};

        notifications.forEach(gatherDataForBatch);

        return Q.all(offeringPromises).then(function () {
            return dataForBatch;
        });

        function gatherDataForBatch(notification) {
            if (notification.batchId != batchId) {
                return;
            }

            throwIfDuplicateLibraries(notification);
            throwIfDuplicateInvoiceNumber(notification);

            var library = librariesById[notification.targetEntity];

            if (library && notification.summaryTotal) {
                offeringPromises.push(
                    loadOfferingsForNotification(notification)
                        .then(createDataRecordsForOfferings)
                );
            }

            function createDataRecordsForOfferings(offerings) {
                dataForBatch[library.id] = {};

                offerings.forEach(function (offering) {
                    if (!offering.product.detailCode) {
                        throw carliError('Cannot generate Banner Feed, ' + offering.product.name + ' is missing detail code');
                    }
                    var detailCode = offering.product.detailCode.slice(0, 4);
                    var bannerFeedData = {
                        batchId: notification.batchId,
                        date: notification.dateCreated,
                        library: library,
                        dollarAmount: OfferingRepository.getFundedSelectionPrice(offering),
                        detailCode: detailCode,
                        detailCodeFull: offering.product.detailCode,
                        invoiceNumber: notification.invoiceNumber
                    };

                    if (!dataForBatch[library.id].hasOwnProperty(detailCode)) {
                        dataForBatch[library.id][detailCode] = [];
                    }
                    dataForBatch[library.id][detailCode].push(bannerFeedData);
                });
            }
        }

        function throwIfDuplicateLibraries(notification) {
            if (seenLibraries.hasOwnProperty(notification.targetEntity)) {
                throw carliError('A library should not appear twice in a single batch');
            } else {
                seenLibraries[notification.targetEntity] = true;
            }
        }

        function throwIfDuplicateInvoiceNumber(notification) {
            if (seenInvoiceNumbers.hasOwnProperty(notification.invoiceNumber)) {
                throw carliError('An invoice number should not appear twice in a single batch');
            } else {
                seenInvoiceNumbers[notification.invoiceNumber] = true;
            }
        }
    }

    function loadOfferingsForNotification(notification) {
        return loadOfferings(notification.targetEntity);

        function loadOfferings(libraryId, offeringsToLoad) {
            if (offeringsToLoad && offeringsToLoad.length) {
                return OfferingRepository
                    .getOfferingsById(offeringsToLoad, cycle)
                    .then(OfferingRepository.filterOutExternallyInvoicedProducts);
            }
            else {
                return OfferingRepository
                    .listOfferingsWithSelectionsForLibrary(libraryId, cycle)
                    .then(OfferingRepository.filterOutExternallyInvoicedProducts);
            }
        }
    }

    function collapseDataByDetailCode(data) {
        return collapseBannerRowsByDetailCode(data);
    }

    function formatBatchAsBannerFeed(bannerFeedData) {
        return formatter(batchId, bannerFeedData);
    }
}

function getDataForBannerExportForMembershipDues(year, batchId, formatter) {
    if (typeof formatter == 'undefined') {
        formatter = formatAsCsv;
    }

    var invoicesForBatchByLibraryId = {};
    var membershipDuesByLibraryId = {};

    return NotificationRepository.listInvoiceNotificationsForMembershipYear(year)
        .then(saveInvoicesForBatch)
        .then(getMembershipData)
        .then(saveMembershipData)
        .then(getLibrariesForExport)
        .then(gatherBannerFeedData)
        .then(exportMembershipBannerFeed);

    function saveInvoicesForBatch(notifications) {

        var invoicesForBatch = notifications.filter(function (notification) {
            return notification.batchId === batchId;
        });

        invoicesForBatch.forEach(function (invoice) {
            invoicesForBatchByLibraryId[invoice.targetEntity] = invoice;
        });

        return invoicesForBatchByLibraryId;
    }

    function getMembershipData() {
        return membershipRepository.loadDataForYear(year);
    }

    function saveMembershipData(membershipData) {
        membershipDuesByLibraryId = membershipData.data;
        return membershipData;
    }

    function getLibrariesForExport(membershipData) {
        return LibraryRepository.getLibrariesById(membershipRepository.listLibrariesWithDues(membershipData))
            .then(function (libraryList) {
                return libraryList.filter(shouldAppearInBannerFeed);
            });
    }

    function gatherBannerFeedData(librariesForBannerExport) {
        var dataForBatch = {};

        librariesForBannerExport.forEach(combineDataForBannerExport);

        return dataForBatch;

        function combineDataForBannerExport(library) {
            var membershipDetailCode = 'USIA';
            var ishareDetailCode = 'USIF';

            var notification = invoicesForBatchByLibraryId[library.id];
            var dues = membershipDuesByLibraryId[library.id];

            dataForBatch[library.id] = {
                USIA: [],
                USIF: []
            };

            if ( dues.membership ){
                addMembershipLine(dues.membership);
            }

            if ( dues.ishare ){
                addIshareLine(dues.ishare);
            }

            function addMembershipLine(dollarAmount) {
                dataForBatch[library.id][membershipDetailCode].push({
                    library: library,
                    invoiceNumber: notification.invoiceNumber,
                    detailCode: membershipDetailCode,
                    dollarAmount: dollarAmount
                });
            }

            function addIshareLine(dollarAmount) {
                dataForBatch[library.id][ishareDetailCode].push({
                    library: library,
                    invoiceNumber: notification.invoiceNumber,
                    detailCode: ishareDetailCode,
                    dollarAmount: dollarAmount
                });
            }
        }
    }

    function exportMembershipBannerFeed(bannerFeedData) {
        return formatter(batchId, bannerFeedData);
    }
}

function shouldAppearInBannerFeed(library) {
    return !library.excludeFromBannerFeed;
}

function formatAsPackedText(batchId, bannerFeedDataByLibraryAndDetailCode) {
    var data = bannerFeedDataByLibraryAndDetailCode;

    var lines = [];
    var bannerHeaderIndicator = '1';
    var bannerRecordIndicator = '2';
    var carliDepartmentIdentifierForHeader = padRight('9CARLI', 8, ' ');
    var carliDepartmentIdentifierForRecord = padRight('9CARLI', 30, ' ');
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

    forEachRecordByLibraryAndDetailCode(function (bannerData) {
        totalDollars += bannerData.dollarAmount;
        lines.push(generateBannerRow(bannerData));
    });

    lines.unshift(generateBannerHeader());
    return lines.join("\r\n");

    function forEachRecordByLibraryAndDetailCode(callback) {
        Object.keys(data).forEach(function (libraryId) {
            Object.keys(data[libraryId]).forEach(function (detailCode) {
                data[libraryId][detailCode].forEach(callback);
            })
        });
    }

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
            invoiceData.detailCode,
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
            padLeft(countTotalRecords(), 5, '0'),
            formatDollarAmountWithLeftPadding(totalDollars),
            carliDepartmentIdentifierForHeader
        ].join('');
    }

    function countTotalRecords() {
        var sum = 0;
        forEachRecordByLibraryAndDetailCode(function (record) {
            sum++;
        });
        return sum;
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
        var mm = d.getMonth() + 1;
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

function formatAsCsv(batchId, bannerFeedDataByLibraryAndDetailCode) {
    var data = bannerFeedDataByLibraryAndDetailCode;
    var lines = [];
    var totalDollars = 0;

    forEachRecordByLibraryAndDetailCode(function (bannerData) {
        totalDollars += bannerData.dollarAmount;
        lines.push(generateBannerRow(bannerData));
    });

    lines.unshift(generateBannerHeader());
    return lines.join("\r\n");

    function forEachRecordByLibraryAndDetailCode(callback) {
        Object.keys(data).forEach(function (libraryId) {
            Object.keys(data[libraryId]).forEach(function (detailCode) {
                data[libraryId][detailCode].forEach(callback);
            })
        });
    }

    function generateBannerRow(invoiceData) {
        if (!invoiceData.library.gar) {
            throw carliError('Cannot generate banner feed for a library with no GAR (' + invoiceData.library.name + ')');
        }
        return [
            invoiceData.library.gar,
            invoiceData.detailCode,
            invoiceData.detailCodeFull ? invoiceData.detailCodeFull : '',
            invoiceData.invoiceNumber,
            '',
            invoiceData.dollarAmount.toFixed(2)
        ].join(',');
    }

    function generateBannerHeader() {
        return [
            'UIN',
            'Detail_Code',
            'Notes/Description',
            'Invoice_Number',
            'Term',
            'Amount'
        ].join(',');
    }
}

function listBatchesForCycle(cycle) {
    return NotificationRepository.listInvoiceNotificationsForCycleId(cycle.id)
        .then(gatherBatchSummaries);

    function gatherBatchSummaries(notifications) {
        var batchSummariesById = {};

        notifications.forEach(getBatchInfo);
        return batchSummariesAsArray();

        function getBatchInfo(notification) {
            if (!batchSummariesById.hasOwnProperty(notification.batchId)) {
                batchSummariesById[notification.batchId] = createBatchSummary(notification);
            } else {
                batchSummariesById[notification.batchId].numInvoices++;
            }
        }

        function createBatchSummary(notification) {
            return {
                batchId: notification.batchId,
                dateCreated: notification.dateCreated,
                summaryTotal: notification.summaryTotal,
                numInvoices: 1
            };
        }

        function batchSummariesAsArray() {
            return Object.keys(batchSummariesById).map(function (batchId) {
                return batchSummariesById[batchId];
            });
        }
    }
}

/**
 * This is used to combine the rows for a single library that are all for the same detail code into one row (Github #48)
 * The function expects the data passed into formatAsPackedText() or formatAsCsv()
 *
 * The data structure in bannerFeedDataByLibraryAndDetailCode looks like
 *
 * 'libraryId': {
 *   DetailCode: [
 *     { data for banner row }
 *   ]
 * }
 *
 *
 * Example:
 *
 * {
 *    '1': {
 *      USII: [
 *        {
 *          batchId: 'USI00001',
 *          date: '',
 *          library: [Object],
 *          dollarAmount: 900,
 *          detailCode: 'USII',
 *          detailCodeFull: 'USII - Fiscal Database',
 *          invoiceNumber: 'USIN03AA'
 *        },
 *        ...
 *      ],
 *      USIB: [ ... ]
 *    },
 *    ...
 * }
 *
 */
function collapseBannerRowsByDetailCode(bannerFeedDataByLibraryAndDetailCode) {
    var dataByLibraryAndCollapsedDetailCode = {};

    Object.keys(bannerFeedDataByLibraryAndDetailCode).forEach(function(libraryId){
        var dataForLibrary = bannerFeedDataByLibraryAndDetailCode[libraryId];
        var collapsedDataByDetailCodeForLibrary = {};

        Object.keys(dataForLibrary).forEach(function(detailCode) {
            var arrayOfRowsForDetailCode = dataForLibrary[detailCode];

            collapsedDataByDetailCodeForLibrary[detailCode] = [];

            if ( arrayOfRowsForDetailCode.length ) {
                var firstRow = arrayOfRowsForDetailCode[0];

                var combinedRow = {
                    batchId: firstRow['batchId'],
                    date: firstRow['date'],
                    library: firstRow['library'],
                    dollarAmount: 0,
                    detailCode: firstRow['detailCode'],
                    detailCodeFull: firstRow['detailCodeFull'],
                    invoiceNumber: firstRow['invoiceNumber']
                };

                arrayOfRowsForDetailCode.forEach(function (row) {
                    combinedRow.dollarAmount += row.dollarAmount;
                });

                collapsedDataByDetailCodeForLibrary[detailCode].push(combinedRow);
            }
        });

        dataByLibraryAndCollapsedDetailCode[libraryId] = collapsedDataByDetailCodeForLibrary;
    });

    return dataByLibraryAndCollapsedDetailCode;
}

module.exports = {
    getDataForBannerExportForSubscriptionCycleAsPackedText: function (cycle, batchId) {
        return getDataForBannerExportForSubscriptionCycle(cycle, batchId, formatAsPackedText);
    },
    getDataForBannerExportForMembershipDuesAsPackedText: function (year, batchId) {
        return getDataForBannerExportForMembershipDues(year, batchId, formatAsPackedText);
    },
    getDataForBannerExportForSubscriptionCycleAsCsv: function (cycle, batchId) {
        return getDataForBannerExportForSubscriptionCycle(cycle, batchId, formatAsCsv);
    },
    getDataForBannerExportForMembershipDuesAsCsv: function (year, batchId) {
        return getDataForBannerExportForMembershipDues(year, batchId, formatAsCsv);
    },
    listBatchesForCycle: listBatchesForCycle,
    collapseBannerRowsByDetailCode: collapseBannerRowsByDetailCode
};

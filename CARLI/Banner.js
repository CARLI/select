
var carliError = require('./Error');
var LibraryRepository = require('./Entity/LibraryRepository');
var NotificationRepository = require('./Entity/NotificationRepository');

function getDataForBannerExport(cycle, batchId) {
    var librariesById = {};

    return LibraryRepository.listActiveLibraries()
        .then(filterLibraries)
        .then(groupLibrariesById)
        .then(loadInvoiceNotifications)
        .then(groupDataByBatchId)
        .then(formatBatchAsBannerFeed);

    function filterLibraries(libraries) {
        return libraries.filter(shouldAppearInBannerFeed);

        function shouldAppearInBannerFeed(library) {
            return !library.excludeFromBannerFeed;
        }
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

module.exports = {
    getDataForBannerExport: getDataForBannerExport
};

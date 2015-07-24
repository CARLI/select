var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var notificationRepository = require('../../../CARLI/Entity/NotificationRepository');
var numeral = require('numeral');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var Q = require('q');
var csvExport = require('csv-stringify');

function exportCsvForVendorReport(notificationId){
    if (!notificationId){
        return Q.reject('missing notification id');
    }

    var csvExportOptions = {
        columns: csvColumns(),
        header: true
    };

    return contentForVendorReport(notificationId)
        .then(function(contentForReport){
            var csvPromise = Q.defer();

            csvExport(contentForReport.data, csvExportOptions, function(err, output){
                if (err) {
                    csvPromise.reject(err);
                } else {
                    csvPromise.resolve({
                        csv: output,
                        fileName: contentForReport.fileName
                    });
                }
            });

            return csvPromise.promise;
        })
        .catch(function(err){
            console.log('exportCsvForVendorReport error',err);
        });
}

function contentForVendorReport(notificationId){
    if (!notificationId){
        return Q.reject('missing notification id');
    }

    return notificationRepository.load(notificationId)
        .then(function(notification) {
            var cycleId = notification.cycle.id;
            var vendor = notification.targetEntity;

            if ( typeIsNotForVendorReport(notification.notificationType) ){
                return Q.reject('Notification specified is not a vendor report it is a '+notification.notificationType);
            }

            return cycleRepository.load(cycleId)
                .then(function(cycle) {
                    return dataForVendorReport(cycle, vendor, notification.offeringIds);
                })
                .then(function(dataForReport){
                    return {
                        data: dataForReport,
                        fileName: fileNameForReport(notification.cycle, vendor)
                    };
                })
                .catch(function(err){
                    console.log('  could not load cycle '+cycleId, err);
                });
        })
        .catch(function(err){
            console.log('Error in contentForVendorReport', err);
        });
}

function typeIsNotForVendorReport( type ){
    return type !== 'report';
}

function dataForVendorReport(cycle, vendor, specificOfferingIds){
    console.log('dataForVendorReport('+cycle.name+', '+vendor.name+(specificOfferingIds?'['+specificOfferingIds.length+']':'')+')');

    return loadOfferings(cycle, vendor.id, specificOfferingIds)
        .then(groupOfferingsForVendorReport)
        .catch(function(err){
            console.log('  ERROR getting offerings for vendor report', err);
        });

    function loadOfferings(cycle, vendorId, offeringsToLoad){
        if ( offeringsToLoad && offeringsToLoad.length ){
            return offeringRepository.getOfferingsById(offeringsToLoad, cycle);
        }
        else {
            return listOfferingsWithSelectionsForVendor(cycle, vendorId);

            function listOfferingsWithSelectionsForVendor(cycle, vendorId){
                var start = new Date();

                return offeringRepository.listOfferingsWithSelections(cycle)
                    .then(filterOfferingsForVendor);

                function filterOfferingsForVendor(offeringsList){
                    var end = new Date();
                    console.log('  Loaded '+offeringsList.length+' offerings - took '+((end-start)/1000)+'s');
                    return offeringsList.filter(function(offering){
                        return offering.vendorId === vendorId;
                    });
                }
            }
        }
    }

    function groupOfferingsForVendorReport(offeringsForVendor) {
        return offeringsForVendor.map(transformOfferingToReportRow);
    }
}

function fileNameForReport(cycle, vendor){
    return vendor.name + '-' + cycle.name + '.csv';
}

function csvColumns(){
    return [
        'Library',
        'Database',
        'S.U.',
        'Price',
        'Sole Source'
    ];
}

function transformOfferingToReportRow(offering){
    return [
        offering.library.name,
        offering.product.name,
        offering.selection.users,
        formatCurrency(offering.selection.price),
        isSoleSource(offering.product)
    ];
}

function formatCurrency( number ){
    return '$'+numeral(number).format('0,0.00');
}

function isSoleSource(product){
    if ( !product ){
        return '';
    }

    var license = product.licenseType || {};
    return license.isSoleSource ? 'Yes' : 'No';
}

module.exports = {
    exportCsvForVendorReport: exportCsvForVendorReport,
    contentForVendorReport: contentForVendorReport
};
var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var fs = require('fs');
var handlebars = require('handlebars');
var libraryRepository = require('../../../CARLI/Entity/LibraryRepository');
var moment = require('moment');
var notificationRepository = require('../../../CARLI/Entity/NotificationRepository');
var notificationTemplateRepository = require('../../../CARLI/Entity/NotificationTemplateRepository');
var numeral = require('numeral');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var pdf = require('html-pdf');
var Q = require('q');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository');

setupHandlebarsHelpers();
var templatesDirectory = 'components/pdf/templates/';
var invoiceContentTemplate = loadAndCompileHandlebarsTemplate('invoiceContentTemplate.handlebars');
var invoicePdfTemplate = loadAndCompileHandlebarsTemplate('invoicePdfTemplate.handlebars');

var batchIdPrefix = 'USI';
var invoiceNumberPrefix = 'USIN';

function exportPdf(type, notificationId){
    var error = validateArguments(type, notificationId);
    if ( error ){
        return Q.reject(error);
    }

    var options = {
        header: {
            height: '15mm'
        },
        footer: {
            height: '5mm',
            contents: '<span>Page {{page}} / {{pages}}</span>'
        }
    };

    return contentForPdf(type, notificationId)
        .then(function (contentForPdf) {
            var pdfPromise = Q.defer();

            pdf.create(contentForPdf.html, options).toBuffer(function (err, result) {
                if (err) {
                    pdfPromise.reject(err);
                }
                pdfPromise.resolve({
                    pdf: result,
                    fileName: contentForPdf.fileName
                });
            });

            return pdfPromise.promise;
        });
}

function contentForPdf(type, notificationId){
    var error = validateArguments(type, notificationId);
    if ( error ){
        return Q.reject(error);
    }

    return notificationRepository.load(notificationId)
        .then(function(notification){
            console.log('Loaded notification for '+notification.targetEntity.name);
            //console.log(notification);

            var cycleId = notification.cycle.id;
            var library = notification.targetEntity;

            return loadCycle(cycleId)
                .then(function(cycle){
                    console.log('  Loaded cycle '+cycle.name+' - get data');
                    return dataForPdf(type, cycle, library, notification.offeringIds);
                })
                .then(function(data){
                    console.log('  Got data - render html');
                    console.log(data);
                    return htmlForPdf(type, data);
                });
        })
        .catch(function(err){
            console.log('Error in generateContentForPdfForNotification', err);
        });
}

/**
 * @param type - one of the PDF types
 * @param cycle - a fully-expanded Cycle Object
 * @param library - a fully-expanded Library Object
 * @param specificOfferingIds - could be undefined. If this is an array of IDs, use those
 *        offerings for the invoice data. If undefined, find all offerings with selections
 *        in the cycle.
 */
function dataForPdf(type, cycle, library, specificOfferingIds ){
    var useFeeForPriceInsteadOfSelectionPrice = typeIsForAccessFeeInvoice(type);

    return loadOfferings(cycle, library.id, specificOfferingIds)
        .then(groupOfferingsForLibraryInvoice)
        .then(function(groupedOfferings){
            return transformOfferingsToPriceRows(groupedOfferings, useFeeForPriceInsteadOfSelectionPrice);
        })
        .then(function(invoiceData){
            return {
                cycle: cycle,
                library: library,
                invoiceData: invoiceData,
                invoiceTotal: computeInvoiceTotal(invoiceData)
            }
        })
        .catch(function(err){
            console.log('ERROR getting data for library selections', err);
        });
}

function loadOfferings(cycle, libraryId, offeringsToLoad){
    if ( offeringsToLoad && offeringsToLoad.length ){
        return offeringRepository.getOfferingsById(offeringsToLoad, cycle);
    }
    else {
        return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
    }
}

function groupOfferingsForLibraryInvoice(offeringsList){
    var offeringsByVendor = groupOfferingsByVendorId(offeringsList);
    return groupOfferingsByVendorName(offeringsByVendor);
}

function groupOfferingsByVendorId(offeringsList){
    var offeringsByVendor = {};

    offeringsList.forEach(function(offering){
        var vendorId = offering.vendorId;
        offeringsByVendor[vendorId] = offeringsByVendor[vendorId] || [];
        offeringsByVendor[vendorId].push(offering);
    });

    return offeringsByVendor;
}

function groupOfferingsByVendorName(offeringsByVendorId){
    var offeringsByVendorName = {};
    var vendorIds = Object.keys(offeringsByVendorId);

    return vendorRepository.getVendorsById(vendorIds)
        .then(function(vendors){
            vendors.forEach(function(vendor){
                offeringsByVendorName[vendor.name] = offeringsByVendorId[vendor.id];
            });
            return offeringsByVendorName;
        });
}

function transformOfferingsToPriceRows(offeringsByVendorName, useFeeForPriceInsteadOfSelectionPrice){
    var results = [];
    var vendorNames = Object.keys(offeringsByVendorName).sort();
    var vendorNameForFirstRowOnly = '';

    vendorNames.forEach(function(vendorName){
        var offeringsForVendor = offeringsByVendorName[vendorName];
        vendorNameForFirstRowOnly = vendorName;

        offeringsForVendor.forEach(function(offering){
            var priceForThisRow = priceForRow(offering);
            if ( priceForThisRow ) {
                results.push({
                    vendor: vendorNameForFirstRowOnly,
                    product: offering.product.name,
                    price: priceForThisRow
                });
                vendorNameForFirstRowOnly = '';
            }
        });
    });

    return results;

    function priceForRow(offering){
        if ( useFeeForPriceInsteadOfSelectionPrice ){
            return offering.product.oneTimePurchaseAnnualAccessFee;
        }
        else {
            return offering.selection.price;
        }
    }
}

function computeInvoiceTotal(invoiceRows){
    var total = 0;

    invoiceRows.forEach(function(row){
        total += row.price;
    });

    return total;
}


/**
 * Takes the data returned by dataForPdf and processes Handlebars templates to produce HTML
 * Actually returns an object with both the HTML string and the filename included
 */
function htmlForPdf(type, dataForPdf){

    var invoiceContent = createInvoiceContent();
    var dataForRenderingPdfContent = dataForPdf;
    
    return fetchTemplateForContent(type)
        .then(function(notificationTemplate){
            dataForRenderingPdfContent.invoiceContent = createInvoiceContent();
            dataForRenderingPdfContent.beforeText = notificationTemplate.pdfBefore;
            dataForRenderingPdfContent.afterText = notificationTemplate.pdfAfter;
            dataForRenderingPdfContent.realInvoice = typeIsForRealInvoice(type);

            return {
                html: createFinalPdfContent(dataForRenderingPdfContent),
                fileName: fileNameForPdf(dataForRenderingPdfContent, type)
            };
        });

    function createInvoiceContent(){
        return invoiceContentTemplate(dataForPdf);
    }

    function createFinalPdfContent(){
        dataForRenderingPdfContent.invoiceNumber = getNextInvoiceNumber();
        dataForRenderingPdfContent.invoiceDate = getInvoiceDate();
        dataForRenderingPdfContent.batchId = getNextBatchId();
        return invoicePdfTemplate(dataForRenderingPdfContent);

        function getNextInvoiceNumber(){
            return invoiceNumberPrefix + '94IA'; /* TODO: generate this letter + number string */
        }

        function getInvoiceDate(){
            return new Date();
        }

        function getNextBatchId(){
            return batchIdPrefix + '10031'; /* TODO: generate this number sequentially */
        }
    }
}

function fetchTemplateForContent(type){
    if ( typeIsForSubscriptionInvoiceEstimate(type) ){
        if ( cycle.isOpenToLibraries() ){
            return notificationTemplateRepository.loadTemplateForOpenCycleEstimates();
        }
        else {
            return notificationTemplateRepository.loadTemplateForClosedCycleEstimates();
        }
    }
    else if ( typeIsForAccessFeeInvoice(type) ) {
        return notificationTemplateRepository.loadTemplateForAnnualAccessFeeInvoices();
    }
    else {
        return notificationTemplateRepository.loadTemplateForSubscriptionInvoices();
    }
}

function fileNameForPdf(dataForPdf, type){
    var data = dataForPdf;
    var cycle = data.cycle;
    var library = data.library;
    return library.name + '-' + cycle.name + '-' + type + '.pdf';
}

function validateArguments(type, notificationId) {
    if (type.toLowerCase() !== 'invoice' &&
        type.toLowerCase() !== 'estimate' &&
        type.toLowerCase() !== 'access-fee-invoice'
    ) {
        console.log('  Error: bad type');
        return 'Invalid type for PDF content: ' + type;
    }

    if (!notificationId) {
        console.log('  Error: no notificationId');
        return 'Missing notification id';
    }
}

function typeIsForSubscriptionInvoice(type){
    return type.toLowerCase() === 'invoice';
}

function typeIsForSubscriptionInvoiceEstimate(type){
    return type.toLowerCase() === 'estimate';
}

function typeIsForAccessFeeInvoice(type){
    return type.toLowerCase() === 'access-fee-invoice';
}

function typeIsForLibrarySelections(type){
    return typeIsForSubscriptionInvoice(type) || typeIsForSubscriptionInvoiceEstimate(type);
}

function typeIsForRealInvoice(type){
    return typeIsForSubscriptionInvoice(type) || typeIsForAccessFeeInvoice(type);
}

function loadCycle(cycleId){
    return cycleRepository.load(cycleId)
        .catch(noCycle);

    function noCycle( err ){
        console.log('  ERROR loading cycle', err);
        if ( err.statusCode == 401 ){
            return Q.reject('unauthorized');
        }
        else {
            return Q.reject('No cycle found with id '+cycleId);
        }
    }
}

function formatCurrency( number ){
    return numeral(number).format('0,0.00');
}

function formatDate( date ){
    return moment(date).format('MM/DD/YYYY');
}

function setupHandlebarsHelpers(){
    handlebars.registerHelper('currency', formatCurrency);
    handlebars.registerHelper('date', formatDate);
}

function loadAndCompileHandlebarsTemplate(fileName){
    var templateHtml = fs.readFileSync(templatesDirectory + fileName, 'utf8');
    return handlebars.compile(templateHtml);
}

module.exports = {
    exportPdf: exportPdf,
    contentForPdf: contentForPdf
};

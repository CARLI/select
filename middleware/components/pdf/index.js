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

function exportPdf(type, libraryId, cycleId){
    console.log('Begin generateContentForPdf '+type+' '+libraryId+' for cycle '+cycleId);

    var error = validateArguments(type, libraryId, cycleId);
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

    return generateContentForPdfForAllProductsInCycle(type, libraryId, cycleId)
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

/**
 * This function looks up a Notification and then passes control to the appropriate content function.
 * If the Notification was an invoice for a sub-set of products, we need to use the offeringIds saved on it.
 * If not, we can use the plain generateDataForPdf function to load all the data.
 */
function generateContentForPdfForNotification(type, notificationId){
    if ( !notificationId ){
        return Q.reject('Missing notification ID');
    }

    return notificationRepository.load(notificationId)
        .then(function(notification){
            console.log('Loaded notification for '+notification.targetEntity.name);
            console.log(notification);

            if ( notification.offeringIds ){
                console.log('  generate data from offerings');
                /*XXX*/return notification;
            }
            else {
                var entityId = notification.targetEntity.id;
                var cycleId = notification.cycle.id;
                return generateContentForPdfForAllProductsInCycle(type, entityId, cycleId);
            }
        })
        .catch(function(err){
            console.log('Error in generateContentForPdfForNotification', err);
        });
}

/**
 * This function combines data and Handlebars templates to return the HTML content which is transformed into a PDF.
 * There are multiple steps to assembling the final HTML:
 *   - Get the data for the PDF (depends on type of invoice, which library, and which cycle)
 *   - Build the data content HTML - for invoices and estimates this is the list of selected products and prices + total
 *   - Load the NotificationTemplate for the appropriate type (same dependencies as the data).
 *   - Compile the data table and text from the notification templates into the final PDF content.
 *     This wraps the content in the hard-coded PDF contents (text that is not customizable, header, footer, etc.)
 *     and inclues the styles to format the PDF.
 *
 * This function returns an object with both the HTML results and the filename for the pdf.
 **/
function generateContentForPdfForAllProductsInCycle(type, entityId, cycleId){
    var error = validateArguments(type, entityId, cycleId);
    if ( error ){
        return Q.reject(error);
    }

    return generateDataForPdf(type, entityId, cycleId)
        .then(htmlForPdf);

    function htmlForPdf(dataForPdf){
        if ( typeIsForLibrarySelections(type) ){
            return htmlForLibrarySelections(dataForPdf);
        }

        if ( typeIsForAccessFeeInvoice(type) ){
            return htmlForLibrarySelections(dataForPdf);
        }

        return Q.reject('invalid type: '+type);
    }

    function htmlForLibrarySelections(dataForLibrarySelections){
        return loadCycle(cycleId)
            .then(function(cycle){
                return fetchTemplateForContent(type, cycle);
            })
            .then(function(notificationTemplate){
                dataForLibrarySelections.invoiceContent = createInvoiceContent();
                dataForLibrarySelections.beforeText = notificationTemplate.pdfBefore;
                dataForLibrarySelections.afterText = notificationTemplate.pdfAfter;
                dataForLibrarySelections.realInvoice = typeIsForRealInvoice(type);

                return {
                    html: createFinalPdfContent(),
                    fileName: fileNameForLibrarySelections(dataForLibrarySelections, type)
                };
            });

        function createInvoiceContent(){
            return invoiceContentTemplate(dataForLibrarySelections);
        }

        function createFinalPdfContent(){
            dataForLibrarySelections.invoiceNumber = getNextInvoiceNumber();
            dataForLibrarySelections.invoiceDate = getInvoiceDate();
            dataForLibrarySelections.batchId = getNextBatchId();
            return invoicePdfTemplate(dataForLibrarySelections);

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

    function fetchTemplateForContent(type, cycle){
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

    function fileNameForLibrarySelections(dataForLibrarySelections, type){
        var data = dataForLibrarySelections;
        var cycle = data.cycle;
        var library = data.library;
        return library.name + '-' + cycle.name + '-' + type + '.pdf';
    }
}

function generateDataForPdf(type, libraryId, cycleId){
    var error = validateArguments(type, libraryId, cycleId);
    if ( error ){
        return Q.reject(error);
    }

    return dataForPdf();

    function dataForPdf(){
        if ( typeIsForLibrarySelections(type) ){
            return dataForLibrarySelections(libraryId);
        }

        if ( typeIsForAccessFeeInvoice(type) ){
            return dataForAccessFeeInvoice(libraryId);
        }

        return Q.reject('invalid type: '+type);
    }

    function dataForLibrarySelections(libraryId){
        var cycle = null;
        var invoiceData = null;

        return loadCycle(cycleId)
            .then(saveCycle)
            .then(loadSelections)
            .then(groupOfferingsForLibraryInvoice)
            .then(transformGroupedOfferingsToListForSubscriptionsInvoiceTable)
            .then(function(invoiceTableData){
                invoiceData = invoiceTableData;
                return libraryRepository.load(libraryId);
            })
            .then(function(loadedLibrary){
                return {
                    cycle: cycle,
                    library: loadedLibrary,
                    invoiceData: invoiceData,
                    invoiceTotal: computeInvoiceTotal(invoiceData)
                }
            })
            .catch(function(err){
                console.log('ERROR getting data for library selections', err);
            });

        function saveCycle(loadedCycle){
            cycle = loadedCycle;
            return cycle;
        }
    }

    function dataForAccessFeeInvoice(libraryId){
        var cycle = null;
        var invoiceData = null;

        return loadCycle(cycleId)
            .then(saveCycle)
            .then(loadSelections)
            .then(groupOfferingsForLibraryInvoice)
            .then(transformGroupedOfferingsToListForAccessFeeInvoiceTable)
            .then(function(invoiceTableData){
                invoiceData = invoiceTableData;
                return libraryRepository.load(libraryId);
            })
            .then(function(loadedLibrary){
                return {
                    cycle: cycle,
                    library: loadedLibrary,
                    invoiceData: invoiceData,
                    invoiceTotal: computeInvoiceTotal(invoiceData)
                }
            })
            .catch(function(err){
                console.log('ERROR getting data for library access fee invoices', err);
            });

        function saveCycle(loadedCycle){
            cycle = loadedCycle;
            return cycle;
        }
    }

    function loadSelections(cycle){
        return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
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

    function transformGroupedOfferingsToListForSubscriptionsInvoiceTable(offeringsByVendorName){
        return processOfferingsIntoPriceRow(offeringsByVendorName, false);
    }

    function transformGroupedOfferingsToListForAccessFeeInvoiceTable(offeringsByVendorName){
        return processOfferingsIntoPriceRow(offeringsByVendorName, true);
    }

    function processOfferingsIntoPriceRow(offeringsByVendorName, useFeeForPriceInsteadOfSelectionPrice){
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
}

function validateArguments(type, entityId, cycleId) {
    if (type.toLowerCase() !== 'invoice' &&
        type.toLowerCase() !== 'estimate' &&
        type.toLowerCase() !== 'access-fee-invoice'
    ) {
        console.log('  Error: bad type');
        return 'Invalid type for PDF content: ' + type;
    }

    if (!entityId) {
        console.log('  Error: no entityId');
        return 'Missing entity id';
    }

    if (!cycleId) {
        console.log('  Error: no cycleId');
        return 'Missing cycle id';
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
    generateContentForPdfForAllProductsInCycle: generateContentForPdfForAllProductsInCycle,
    generateContentForPdfForNotification: generateContentForPdfForNotification,
    generateDataForPdf: generateDataForPdf
};

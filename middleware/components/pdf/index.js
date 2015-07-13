var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var fs = require('fs');
var handlebars = require('handlebars');
var libraryRepository = require('../../../CARLI/Entity/LibraryRepository');
var moment = require('moment');
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

function exportPdf(type, entityId, cycleId){
    console.log('Begin generateContentForPdf '+type+' '+entityId+' for cycle '+cycleId);

    var error = validateArguments(type, entityId, cycleId);
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

    return generateContentForPdf(type, entityId, cycleId)
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
 * This function combines data and Handlebars templates to return the HTML content which is transformed into a PDF.
 * There are multiple steps to assembling the final HTML:
 *   - Get the data for the PDF (depends on type of invoice/report, which library/vendor, and which cycle)
 *   - Build the data content HTML - for invoices and estimates this is the list of selected products and prices + total
 *   - Load the NotificationTemplate for the appropriate type (same dependencies as the data).
 *   - Compile the data table and text from the notification templates into the final PDF content.
 *     This wraps the content in the hard-coded PDF contents (text that is not customizable, header, footer, etc.)
 *     and inclues the styles to format the PDF.
 *
 * This function returns an object with both the HTML results and the filename for the pdf.
 **/
function generateContentForPdf(type, entityId, cycleId){
    console.log('Begin generateContentForPdf '+type+' '+entityId+' for cycle '+cycleId);

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

        if ( typeIsForVendorReport(type) ){
            return htmlForVendorReport(dataForPdf);
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

    function htmlForVendorReport(dataForVendorReport){
        /**/return dataForVendorReport;
    }

    function fetchTemplateForContent(type, cycle){
        if ( type === 'estimate' ){
            if ( cycle.isOpenToLibraries() ){
                return notificationTemplateRepository.loadTemplateForOpenCycleEstimates();
            }
            else {
                return notificationTemplateRepository.loadTemplateForClosedCycleEstimates();
            }
        }
        else {
            return notificationTemplateRepository.loadTemplateForInvoices();
        }
    }

    function fileNameForLibrarySelections(dataForLibrarySelections, type){
        var data = dataForLibrarySelections;
        var cycle = data.cycle;
        var library = data.library;
        return library.name + '-' + cycle.name + '-' + type + '.pdf';
    }
}

function generateDataForPdf(type, entityId, cycleId){
    console.log('Begin generateDataForPdf '+type+' '+entityId+' for cycle '+cycleId);

    var error = validateArguments(type, entityId, cycleId);
    if ( error ){
        return Q.reject(error);
    }

    return dataForPdf();

    function dataForPdf(){
        if ( typeIsForLibrarySelections(type) ){
            return dataForLibrarySelections(entityId);
        }

        if ( typeIsForVendorReport(type) ){
            return dataForVendorReport(entityId);
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
            .then(transformGroupedOfferingsToListForInvoiceTable)
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
        }

        function loadSelections(){
            return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
        }
    }

    function dataForVendorReport(vendorId){
        var cycle = null;

        return loadCycle(cycleId)
            .then(saveCycle)
            .then(vendorRepository.load(vendorId))
            .then(function(vendor){
                return {
                    cycle: cycle,
                    vendor: vendor,
                    data: {}
                }
            });

        function saveCycle(loadedCycle){
            cycle = loadedCycle;
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

    function transformGroupedOfferingsToListForInvoiceTable(offeringsByVendorName){
        var results = [];
        var vendorNames = Object.keys(offeringsByVendorName).sort();
        var vendorNameForFirstRowOnly = '';

        vendorNames.forEach(function(vendorName){
            var offeringsForVendor = offeringsByVendorName[vendorName];
            vendorNameForFirstRowOnly = vendorName;

            offeringsForVendor.forEach(function(offering){
                results.push({
                    vendor: vendorNameForFirstRowOnly,
                    product: offering.product.name,
                    price: offering.selection.price
                });
                vendorNameForFirstRowOnly = '';
            });
        });

        return results;
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
        type.toLowerCase() !== 'report'
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

function typeIsForLibrarySelections(type){
    return type.toLowerCase() === 'invoice' || type.toLowerCase() === 'estimate';
}

function typeIsForVendorReport(type){
    return type.toLowerCase() === 'report';
}

function typeIsForRealInvoice(type){
    return type.toLowerCase() === 'invoice';
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
    generateContentForPdf: generateContentForPdf,
    generateDataForPdf: generateDataForPdf
};

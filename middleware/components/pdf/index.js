var fs = require('fs');
var handlebars = require('handlebars');
var moment = require('moment');
var numeral = require('numeral');
var pdf = require('html-pdf');
var Q = require('q');

var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var invoiceGeneration = require('./invoiceNumberGeneration');
var membershipRepository = require('../../../CARLI/Entity/MembershipRepository');
var notificationRepository = require('../../../CARLI/Entity/NotificationRepository');
var notificationTemplateRepository = require('../../../CARLI/Entity/NotificationTemplateRepository');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository');

setupHandlebarsHelpers();
var templatesDirectory = 'components/pdf/templates/';
var subscriptionInvoiceContentTemplate = loadAndCompileHandlebarsTemplate('subscriptionInvoiceContentTemplate.handlebars');
var membershipInvoiceContentTemplate = loadAndCompileHandlebarsTemplate('membershipInvoiceContentTemplate.handlebars');
var invoicePdfTemplate = loadAndCompileHandlebarsTemplate('invoicePdfTemplate.handlebars');

function exportPdf(notificationId){
    var error = validateArguments(notificationId);
    if ( error ){
        return Q.reject(error);
    }

    var options = {
        header: {
            height: '21mm'
        },
        footer: {
            height: '5mm',
            contents: '<span>Page {{page}} / {{pages}}</span>'
        }
    };

    return contentForPdf(notificationId)
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

function contentForPdf(notificationId){
    var error = validateArguments(notificationId);
    if ( error ){
        return Q.reject(error);
    }

    return notificationRepository.loadWithoutCycle(notificationId)
        .then(dataForPdfFromNotification)
        .then(htmlForPdf)
        .catch(function(err){
            Logger.log('Error in contentForPdf', err, err.stack);
            return Q.reject(error);
        });
}

function dataForPdfFromNotification(notification){
    if ( notification.isMembershipDuesInvoice || notification.isMembershipDuesEstimate ) {
        return dataForMembershipDuesInvoicePdf(notification);
    }
    else {
        return dataForSubscriptionInvoicePdf(notification);
    }
}

function dataForMembershipDuesInvoicePdf(notification){
    var library = notification.targetEntity;
    var year = notification.fiscalYear;

    if ( notification.dataForPdf ) {
        Logger.log('dataForMembershipInvoicePdf - skipping generation!');
        return notification.dataForPdf;
    }
    else {
        return membershipRepository.getMembershipFeesForLibrary(library.id, year)
        .then(function(membershipData){
            var membership = membershipData.membership || 0;
            var ishare = membershipData.ishare || 0;
            var dataForPdf =  {
                batchId: notification.batchId,
                cycle: {},
                library: library,
                invoiceNumber: notification.invoiceNumber,
                invoiceTotal: ishare + membership,
                ishare: ishare,
                membership: membership,
                notificationTypeForPdf: pdfTypeFromNotification(notification),
                notificationDraftStatus: notification.draftStatus,
                notificationDateSent: notification.dateSent,
                notificationDateCreated: notification.dateCreated,
                year: year
            };
            return dataForPdf;
        })
        .then(function(pdfData) {
            Logger.log('got pdf data, update notification');                   
            notification.dataForPdf = pdfData;
            process.nextTick(function(){
                notificationRepository.update(notification)
                .then(function(){
                    Logger.log('Update finished - pdf content saved');
                })
                .catch(function(err){
                    Logger.log('Updated failed', err);
                });
            });

            return pdfData;
        })
        .catch(function(err){
            Logger.log('ERROR getting data for membership invoice pdf', err);
        });
    }
}

function dataForSubscriptionInvoicePdf(notification){
    var cycle = null;

    var pdfType = pdfTypeFromNotification(notification);
    var cycleId = notification.cycle;
    var library = notification.targetEntity;
    var specificOfferingIds = notification.offeringIds;

    var useFeeForPriceInsteadOfSelectionPrice = typeIsForAccessFeeInvoice(pdfType);

    if ( notification.dataForPdf ) {
        Logger.log('dataForSubscriptionInvoicePdf - skipping generation!');
        return notification.dataForPdf;
    }
    else {
        return cycleRepository.load(cycleId)
            .then(function(loadedcycle){
                cycle = loadedcycle;
                Logger.log('dataForSubscriptionInvoicePdf('+pdfType+', '+cycle.name+', '+library.name+(specificOfferingIds?'['+specificOfferingIds.length+']':'')+')');
                return loadOfferings(cycle, library.id, specificOfferingIds);
            })
            .then(groupOfferingsForLibraryInvoice)
            .then(function(groupedOfferings){
                return transformOfferingsToPriceRows(groupedOfferings, useFeeForPriceInsteadOfSelectionPrice);
            })
            .then(function(invoiceData){
                return {
                    batchId: notification.batchId,
                    cycle: cycle,
                    library: library,
                    invoiceData: invoiceData,
                    invoiceNumber: notification.invoiceNumber,
                    invoiceTotal: computeInvoiceTotal(invoiceData),
                    notificationTypeForPdf: pdfTypeFromNotification(notification),
                    notificationDraftStatus: notification.draftStatus,
                    notificationDateSent: notification.dateSent,
                    notificationDateCreated: notification.dateCreated
                };
            })
            .then(function(pdfData) {
                Logger.log('got pdf data, update notification');                   
                notification.dataForPdf = pdfData;
                process.nextTick(function(){
                    notificationRepository.update(notification)
                    .then(function(){
                        Logger.log('Update finished - pdf content saved');
                    })
                    .catch(function(err){
                        Logger.log('Updated failed', err);
                    });
                });

                return pdfData;
            })
            .catch(function(err){
                Logger.log('ERROR getting data for library selections', err);
            });
    }
}

function loadOfferings(cycle, libraryId, offeringsToLoad){
    if ( offeringsToLoad && offeringsToLoad.length ){
        return offeringRepository.getOfferingsById(offeringsToLoad, cycle);
    }
    else {
        return offeringRepository
            .listOfferingsWithSelectionsForLibrary(libraryId, cycle)
            .then(offeringRepository.filterOutExternallyInvoicedProducts);
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
            return offering.oneTimePurchaseAnnualAccessFee || 0;
        }
        else {
            return offeringRepository.getFundedSelectionPrice(offering);
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

function htmlForPdf(dataForPdf){

    if (!dataForPdf) {
        return Q.reject('no data for pdf');
    }

    var type = dataForPdf.notificationTypeForPdf;
    var invoiceContent = createInvoiceContent();
    var dataForRenderingPdfContent = dataForPdf;
    
    return fetchTemplateForContent(type, dataForPdf.cycle)
        .then(function(notificationTemplate){
            dataForRenderingPdfContent.invoiceContent = invoiceContent;
            dataForRenderingPdfContent.beforeText = notificationTemplate.pdfBefore;
            dataForRenderingPdfContent.afterText = notificationTemplate.pdfAfter;
            dataForRenderingPdfContent.realInvoice = typeIsForRealInvoice(type);

            return {
                html: createFinalPdfContent(dataForRenderingPdfContent),
                fileName: fileNameForPdf(dataForRenderingPdfContent, type)
            };
        });

    function createInvoiceContent(){
        if ( typeIsForMembershipInvoiceOrEstimate(type) ){
            return membershipInvoiceContentTemplate(dataForPdf);
        }
        else {
            return subscriptionInvoiceContentTemplate(dataForPdf);
        }
    }

    function createFinalPdfContent(){
        //dataForRenderingPdfContent.invoiceDate = new Date();
        if (dataForPdf.notificationDraftStatus == "sent") {
            dataForRenderingPdfContent.invoiceDate = dataForPdf.notificationDateSent;
        } else {
            dataForRenderingPdfContent.invoiceDate = dataForPdf.notificationDateCreated;
        }
        console.log("creating final PDF content, with date " + dataForRenderingPdfContent.invoiceDate);
        return invoicePdfTemplate(dataForRenderingPdfContent);
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
    else if ( typeIsForMembershipDuesInvoice(type) ){
        return notificationTemplateRepository.loadTemplateForMembershipDuesInvoices();
    }
    else if ( typeIsForMembershipDuesEstimate(type) ) {
        return notificationTemplateRepository.loadTemplateForMembershipDuesEstimates();
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

function validateArguments(notificationId) {
    if (!notificationId) {
        Logger.log('  Error: no notificationId');
        return 'Missing notification id';
    }
}

function pdfTypeFromNotification(notification){
    if ( notification.isFeeInvoice ){
        return 'access-fee-invoice';
    }
    else if ( notification.isMembershipDuesInvoice ) {
        return 'membership-dues-invoice';
    }
    else if ( notification.isMembershipDuesEstimate  ) {
        return 'membership-dues-estimate';
    }
    else {
        return notification.notificationType;
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

function typeIsForMembershipDuesInvoice(type){
    return type.toLowerCase() === 'membership-dues-invoice';
}

function typeIsForMembershipDuesEstimate(type){
    return type.toLowerCase() === 'membership-dues-estimate';
}

function typeIsForMembershipInvoiceOrEstimate(type){
    return typeIsForMembershipDuesInvoice(type) || typeIsForMembershipDuesEstimate(type);
}

function typeIsForLibrarySelections(type){
    return typeIsForSubscriptionInvoice(type) || typeIsForSubscriptionInvoiceEstimate(type);
}

function typeIsForRealInvoice(type){
    return typeIsForSubscriptionInvoice(type) ||
           typeIsForAccessFeeInvoice(type) ||
           typeIsForMembershipDuesInvoice(type);
}

function loadCycle(cycleId){
    return cycleRepository.load(cycleId)
        .catch(noCycle);

    function noCycle( err ){
        Logger.log('  ERROR loading cycle', err);
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
    contentForPdf: contentForPdf,
    generateNextBatchId: invoiceGeneration.generateNextBatchId,
    generateNextInvoiceNumber: invoiceGeneration.generateNextInvoiceNumber
};

var config = require('../../config');
var cycleRepository = require('../Entity/CycleRepository');
var libraryRepository = require('../Entity/LibraryRepository');
var invoiceNumbers = require('../../config/environmentDependentModules/invoiceNumberGeneration');
var membershipRepository = require('../Entity/MembershipRepository');
var notificationRepository = require('../Entity/NotificationRepository');
var offeringRepository = require('../Entity/OfferingRepository');
var productRepository = require('../Entity/ProductRepository');
var uuid = require('node-uuid');
var vendorRepository = require('../Entity/VendorRepository');
var Q = require('q');

function getAnnualAccessFeeDraftForOneLibrary(template, notificationData) {

    function getEntitiesForAnnualAccessFeeDraftForOneLibrary() {
        return libraryRepository.load(notificationData.recipientId);
    }
    function getRecipientsForAnnualAccessFeeDraftForOneLibrary() {
        return annualAccessOneLibraryDraft.getEntities()
            .then(function( libraryFromNotificationData ) {
                return [ convertEntityToRecipient(libraryFromNotificationData, template) ];
            });
    }
    function getOfferingsForAnnualAccessFeeDraftForOneLibrary() {
        return cycleRepository.load(config.oneTimePurchaseProductsCycleDocId).then(function (cycle) {
            return offeringRepository.listOfferingsForLibraryId(notificationData.recipientId, cycle);
        });
    }
    function getNotificationsForAnnualAccessFeeDraftForOneLibrary( customizedTemplate, actualRecipientIds ){
        return annualAccessOneLibraryDraft.getOfferings()
            .then(filterOnlyPurchasedOfferingsWithFees)
            .then(generateNotifications);

        function generateNotifications(offerings){
            return invoiceNumbers.generateNextBatchId()
                .then(function (batchId) {
                    return Q.all(actualRecipientIds.map(function(id){
                        return generateNotificationForLibrary(id, offerings, customizedTemplate, batchId)
                    }));
                });
        }
    }
    var annualAccessOneLibraryDraft = {
        getAudienceAndSubject: function() { return 'One Library, Annual Access Fee'; },
        getEntities: getEntitiesForAnnualAccessFeeDraftForOneLibrary,
        getRecipients: getRecipientsForAnnualAccessFeeDraftForOneLibrary,
        getOfferings: getOfferingsForAnnualAccessFeeDraftForOneLibrary,
        getNotifications: getNotificationsForAnnualAccessFeeDraftForOneLibrary
    };
    return annualAccessOneLibraryDraft;
}
function getAnnualAccessFeeDraftForAllLibraries(template, notificationData) {

    function getEntitiesForAnnualAccessFeeDraftForAllLibraries() {
        return loadLibrariesWithSelectionsInCycle(config.oneTimePurchaseProductsCycleDocId);
    }
    function getRecipientsForAnnualAccessFeeDraftForAllLibraries() {
        return annualAccessAllLibrariesDraft.getEntities()
            .then(function( librariesWithSelections ) {
                return librariesWithSelections.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });
    }
    function getOfferingsForAnnualAccessFeeDraftForAllLibraries() {
        return cycleRepository.load(config.oneTimePurchaseProductsCycleDocId).then(function (cycle) {
            return offeringRepository.list(cycle);
        });
    }
    function getNotificationsForAnnualAccessFeeDraftForAllLibraries( customizedTemplate, actualRecipientIds ){
        return annualAccessAllLibrariesDraft.getOfferings()
            .then(filterOnlyPurchasedOfferingsWithFees)
            .then(generateNotifications);

        function generateNotifications(offerings){
            return invoiceNumbers.generateNextBatchId()
                .then(function (batchId) {
                    return Q.all(actualRecipientIds.map(function(id){
                        return generateNotificationForLibrary(id, offerings, customizedTemplate, batchId)
                    }));
                });
        }
    }

    var annualAccessAllLibrariesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, Annual Access Fee'; },
        getEntities: getEntitiesForAnnualAccessFeeDraftForAllLibraries,
        getRecipients: getRecipientsForAnnualAccessFeeDraftForAllLibraries,
        getOfferings: getOfferingsForAnnualAccessFeeDraftForAllLibraries,
        getNotifications: getNotificationsForAnnualAccessFeeDraftForAllLibraries
    };
    return annualAccessAllLibrariesDraft;
}

function getReminder(template, notificationData) {

    function getLibrariesWithSelections() {
        return cycleRepository.load(notificationData.cycleId).then(function(cycle){
            return libraryRepository.listLibrariesWithSelectionsInCycle(cycle);
        });
    }
    function getAllLibraries() {
        return libraryRepository.listActiveLibraries();
    }

    function getRecipientsForReminder() {
        return reminderDraft.getLibrariesWithSelections()
            .then(function( librariesWithSelectionsInCycle ) {
                return reminderDraft.getAllLibraries().then(function(allLibraries) {
                    return listLibrariesThatHaveNotMadeSelections(librariesWithSelectionsInCycle, allLibraries);
                });
            })
            .then(function(librariesToContact){
                return librariesToContact.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });

        function listLibrariesThatHaveNotMadeSelections( librariesThatHaveMadeSelections, allLibraries ){
            return allLibraries.filter(function(library){
                return hasNotMadeSelection(library);
            });

            function hasNotMadeSelection( lib ){
                var index = librariesThatHaveMadeSelections.indexOf( lib.id.toString() );

                if ( index > -1 ){
                    librariesThatHaveMadeSelections.splice(index,1);
                    return false;
                }
                return true;
            }
        }
    }

    function getNotificationsForReminder( customizedTemplate, actualRecipientIds ){
        return Q.all(actualRecipientIds.map(function(id){
            return generateNotificationForLibrary(id, null, customizedTemplate);
        }));
    }

    var reminderDraft = {
        getAudienceAndSubject: function() { return 'Reminder'; },
        getLibrariesWithSelections: getLibrariesWithSelections,
        getAllLibraries: getAllLibraries,
        getRecipients: getRecipientsForReminder,
        getNotifications: getNotificationsForReminder
    };

    return reminderDraft;
}

function getVendorReportsForAll(template, notificationData) {

    function getEntitiesForVendorReportsForAll() {
        return cycleRepository.load(notificationData.cycleId)
            .then(productRepository.listProductCountsByVendorId)
            .then(extractArrayOfIdsFromObject)
            .then(vendorRepository.getVendorsById);
    }

    function getRecipientsForVendorReportsForAll() {
        return allVendorsDraft.getEntities()
            .then(function( vendorsWithProductsInCycle ) {
                return vendorsWithProductsInCycle.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    function getOfferingsForVendorReportsForAll(){
        return cycleRepository.load(notificationData.cycleId).then(offeringRepository.listOfferingsWithSelections);
    }

    function getNotificationsForVendorReportsForAll( customizedTemplate, actualRecipientIds ){
        return allVendorsDraft.getOfferings()
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForVendor(id, offerings, customizedTemplate);
                });
            });
    }

    var allVendorsDraft = {
        getAudienceAndSubject: function() { return 'All Vendors, All Products'; },
        getEntities: getEntitiesForVendorReportsForAll,
        getRecipients: getRecipientsForVendorReportsForAll,
        getOfferings: getOfferingsForVendorReportsForAll,
        getNotifications: getNotificationsForVendorReportsForAll
    };
    return allVendorsDraft;
}
function getVendorReportsForSome(template, notificationData) {
    function getEntitiesForVendorReportsForSome() {
        return cycleRepository.load(notificationData.cycleId)
            .then(function(cycle){
                return offeringRepository.listVendorsFromOfferingIds(notificationData.offeringIds, cycle);
            })
            .then(vendorRepository.getVendorsById);
    }

    function getRecipientsForVendorReportsForSome() {
        return someVendorsDraft.getEntities()
            .then(function( vendorsFromSelectedOfferings ) {
                return vendorsFromSelectedOfferings.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    function getOfferingsForVendorReportsForSome(){
        return cycleRepository.load(notificationData.cycleId)
            .then(function(cycle){
                return offeringRepository.getOfferingsById(notificationData.offeringIds, cycle);
            });
    }

    function getNotificationsForVendorReportsForSome( customizedTemplate, actualRecipientIds ){
        var saveOfferingIdsToNotification = true;

        return someVendorsDraft.getOfferings()
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForVendor(id, offerings, customizedTemplate, saveOfferingIdsToNotification);
                });
            });
    }

    var someVendorsDraft = {
        getAudienceAndSubject: function() { return 'One or more Vendors, One or more Products'; },
        getEntities: getEntitiesForVendorReportsForSome,
        getRecipients: getRecipientsForVendorReportsForSome,
        getOfferings: getOfferingsForVendorReportsForSome,
        getNotifications: getNotificationsForVendorReportsForSome
    };
    return someVendorsDraft;
}
function getVendorReportsForOne(template, notificationData) {
    function getEntitiesForVendorReportsForOne() {
        return vendorRepository.load(notificationData.recipientId).then(function(vendor) {
            return [ vendor ];
        });
    }

    function getRecipientsForVendorReportsForOne() {
        return oneVendorDraft.getEntities()
            .then(function( vendorFromNotificationData ) {
                return vendorFromNotificationData.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    function getOfferingsForVendorReportsForOne(){
        var vendorForThisReport = notificationData.recipientId;

        return cycleRepository.load(notificationData.cycleId)
            .then(offeringRepository.listOfferingsWithSelections)
            .then(getOfferingsForVendor);

        function getOfferingsForVendor( listOfOfferings ){
            return listOfOfferings.filter(function(offering){
                return offering.product.vendor === vendorForThisReport;
            });
        }
    }

    function getNotificationsForVendorReportsForOne( customizedTemplate, actualRecipientIds ){
        return oneVendorDraft.getOfferings()
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForVendor(id, offerings, customizedTemplate);
                });
            });
    }

    var oneVendorDraft = {
        getAudienceAndSubject: function() { return 'One Vendor, All Products'; },
        getEntities: getEntitiesForVendorReportsForOne,
        getRecipients: getRecipientsForVendorReportsForOne,
        getOfferings: getOfferingsForVendorReportsForOne,
        getNotifications: getNotificationsForVendorReportsForOne
    };
    return oneVendorDraft;
}

function getLibraryInvoicesForAll(template, notificationData) {
    function getEntitiesForLibraryInvoicesForAll() {
        return loadLibrariesWithSelectionsInCycle(notificationData.cycleId);
    }
    function getRecipientsForLibraryInvoicesForAll() {
        return allLibrariesDraft.getEntities()
            .then(function( librariesWithSelections ) {
                return librariesWithSelections.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }
    function getOfferingsForLibraryInvoicesForAll(){
        return cycleRepository.load(notificationData.cycleId)
            .then(offeringRepository.listOfferingsWithSelections)
            .then(offeringRepository.filterOutExternallyInvoicedProducts);
    }
    function getNotificationsForLibraryInvoicesForAll(customizedTemplate, actualRecipientIds){
        return allLibrariesDraft.getOfferings()
            .then(generateNotifications);

        function generateNotifications(offerings){
            return invoiceNumbers.generateNextBatchId()
                .then(function (batchId) {
                    return Q.all(actualRecipientIds.map(function(id){
                        return generateNotificationForLibrary(id, offerings, customizedTemplate, batchId)
                    }));
                });
        }
    }

    var allLibrariesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, All Products'; },
        getEntities: getEntitiesForLibraryInvoicesForAll,
        getRecipients: getRecipientsForLibraryInvoicesForAll,
        getOfferings: getOfferingsForLibraryInvoicesForAll,
        getNotifications: getNotificationsForLibraryInvoicesForAll
    };
    return allLibrariesDraft;
}
function getLibraryInvoicesForSome(template, notificationData) {

    function getEntitiesForLibraryInvoicesForSome() {
        return someLibrariesDraft.getOfferings().then(function(offerings) {
            var libraryIds = offerings.map(getLibraryIdFromOffering).filter(discardDuplicateIds);
            return libraryRepository.getLibrariesById(libraryIds);
        });
    }

    function getLibraryIdFromOffering(offering) {
        return offering.library.id;
    }

    function getRecipientsForLibraryInvoicesForSome() {
        return someLibrariesDraft.getEntities()
            .then(function( librariesFromOfferings ) {
                return librariesFromOfferings.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    function getOfferingsForLibraryInvoicesForSome(){
        return cycleRepository
            .load(notificationData.cycleId)
            .then(function (cycle) {
                return offeringRepository.getOfferingsById(notificationData.offeringIds, cycle);
            })
            .then(offeringRepository.filterOutExternallyInvoicedProducts);
    }

    function getNotificationsForLibraryInvoicesForSome(customizedTemplate, actualRecipientIds){
        var saveOfferingIdsToNotification = true;

        return someLibrariesDraft.getOfferings()
            .then(filterOnlyPurchasedOfferings)
            .then(generateNotifications);

        function generateNotifications(offerings){
            return invoiceNumbers.generateNextBatchId()
                .then(function (batchId) {
                    return Q.all(actualRecipientIds.map(function(id){
                        return generateNotificationForLibrary(id, offerings, customizedTemplate, batchId, saveOfferingIdsToNotification)
                    }));
                });
        }
    }

    var someLibrariesDraft = {
        getAudienceAndSubject: function() { return 'One or more Libraries, One or more Products'; },
        getEntities: getEntitiesForLibraryInvoicesForSome,
        getRecipients: getRecipientsForLibraryInvoicesForSome,
        getOfferings: getOfferingsForLibraryInvoicesForSome,
        getNotifications: getNotificationsForLibraryInvoicesForSome
    };
    return someLibrariesDraft;
}
function getLibraryInvoicesForOne(template, notificationData, batchId) {

    function getEntitiesForLibraryInvoicesForOne() {
        return libraryRepository.load(notificationData.recipientId).then(function (library) {
            return [ library ];
        });
    }
    function getRecipientsForLibraryInvoicesForOne() {
        return oneLibraryDraft.getEntities()
            .then(function( libraryFromNotificationData ) {
                return libraryFromNotificationData.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });
    }
    function getOfferingsForLibraryInvoicesForOne(){
        return cycleRepository
            .load(notificationData.cycleId).then(function (cycle) {
                return offeringRepository.listOfferingsForLibraryId(notificationData.recipientId, cycle);
            })
            .then(filterOnlyPurchasedOfferings)
            .then(offeringRepository.filterOutExternallyInvoicedProducts);
    }
    function getNotificationsForLibraryInvoicesForOne(customizedTemplate, actualRecipientIds){
        return oneLibraryDraft.getOfferings()
            .then(generateNotifications);

        function generateNotifications(offerings){
            return invoiceNumbers.generateNextBatchId()
                .then(function (batchId) {
                    return Q.all(actualRecipientIds.map(function(id){
                        return generateNotificationForLibrary(id, offerings, customizedTemplate, batchId)
                    }));
                });
        }
    }

    var oneLibraryDraft = {
        getAudienceAndSubject: function() { return 'One Library, All Products'; },
        getEntities: getEntitiesForLibraryInvoicesForOne,
        getRecipients: getRecipientsForLibraryInvoicesForOne,
        getOfferings: getOfferingsForLibraryInvoicesForOne,
        getNotifications: getNotificationsForLibraryInvoicesForOne
    };
    return oneLibraryDraft;
}

function getLibraryEstimatesForAll(template, notificationData) {
    function getEntitiesForLibraryEstimatesForAll() {
        return loadLibrariesWithSelectionsInCycle(notificationData.cycleId);
    }
    function getRecipientsForLibraryEstimatesForAll() {
        return allLibrariesDraft.getEntities()
            .then(function( allLibraries ) {
                return allLibraries.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }
    function getOfferingsForLibraryEstimatesForAll(){
        return cycleRepository.load(notificationData.cycleId)
            .then(offeringRepository.listOfferingsWithSelections)
            .then(offeringRepository.filterOutExternallyInvoicedProducts);
    }
    function getNotificationsForLibraryEstimatesForAll(customizedTemplate, actualRecipientIds){
        return allLibrariesDraft.getOfferings()
            .then(function(offerings){
                return Q.all(actualRecipientIds.map(function(id){
                    return generateNotificationForLibrary(id, offerings, customizedTemplate);
                }));
            });
    }

    var allLibrariesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, All Products'; },
        getEntities: getEntitiesForLibraryEstimatesForAll,
        getRecipients: getRecipientsForLibraryEstimatesForAll,
        getOfferings: getOfferingsForLibraryEstimatesForAll,
        getNotifications: getNotificationsForLibraryEstimatesForAll
    };
    return allLibrariesDraft;
}

function getMembershipDuesInvoiceDraftForAllLibraries(template, notificationData){
    function getEntitiesForMembershipDuesDraftForAllLibraries(){
        return membershipRepository.loadDataForYear(notificationData.fiscalYear)
            .then(membershipRepository.listLibrariesWithDues)
            .then(libraryRepository.getActiveLibrariesById);
    }

    function getRecipientsForMembershipDuesDraftForAllLibraries(){
        return membershipDuesAllLibrariesInvoicesDraft.getEntities()
            .then(function( libraries ) {
                return libraries.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });
    }

    function getOfferingsForMembershipDuesDraftForAllLibraries(){
        return membershipRepository.loadDataForYear(notificationData.fiscalYear)
            .then(membershipRepository.getMembershipDuesAsOfferings);
    }

    function getNotificationsForMembershipDuesDraftForAllLibraries( customizedTemplate, actualRecipientIds ){
        return membershipDuesAllLibrariesInvoicesDraft.getOfferings()
            .then(generateNotifications);

        function generateNotifications(offerings){
            return invoiceNumbers.generateNextBatchId()
                .then(function (batchId) {
                    return Q.all(actualRecipientIds.map(function(id){
                        return generateNotificationForLibrary(id, offerings, customizedTemplate, batchId)
                    }));
                })
                .then(function(arrayOfNotifications){
                    return arrayOfNotifications.map(addFiscalYearProperty);
                });
        }

        function addFiscalYearProperty(notification){
            notification.fiscalYear = notificationData.fiscalYear;
            return notification;
        }
    }

    var membershipDuesAllLibrariesInvoicesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, Membership Dues Invoices'; },
        getEntities: getEntitiesForMembershipDuesDraftForAllLibraries,
        getRecipients: getRecipientsForMembershipDuesDraftForAllLibraries,
        getOfferings: getOfferingsForMembershipDuesDraftForAllLibraries,
        getNotifications: getNotificationsForMembershipDuesDraftForAllLibraries
    };
    return membershipDuesAllLibrariesInvoicesDraft;
}
function getMembershipDuesEstimateDraftForAllLibraries(template, notificationData){
    function getEntitiesForMembershipDuesDraftForAllLibraries(){
        return membershipRepository.loadDataForYear(notificationData.fiscalYear)
            .then(membershipRepository.listLibrariesWithDues)
            .then(libraryRepository.getActiveLibrariesById);
    }

    function getRecipientsForMembershipDuesDraftForAllLibraries(){
        return membershipDuesAllLibrariesEstimatesDraft.getEntities()
            .then(function( libraries ) {
                return libraries.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });
    }

    function getOfferingsForMembershipDuesDraftForAllLibraries(){
        return membershipRepository.loadDataForYear(notificationData.fiscalYear)
            .then(membershipRepository.getMembershipDuesAsOfferings);
    }

    function getNotificationsForMembershipDuesDraftForAllLibraries( customizedTemplate, actualRecipientIds ){
        return membershipDuesAllLibrariesEstimatesDraft.getOfferings()
            .then(generateNotifications);

        function generateNotifications(offerings){
                return Q.all(actualRecipientIds.map(function(id){
                    return generateNotificationForLibrary(id, offerings, customizedTemplate)
                }))
                .then(function(arrayOfNotifications){
                    return arrayOfNotifications.map(addFiscalYearProperty);
                });
        }

        function addFiscalYearProperty(notification){
            notification.fiscalYear = notificationData.fiscalYear;
            return notification;
        }
    }

    var membershipDuesAllLibrariesEstimatesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, Membership Dues Estimates'; },
        getEntities: getEntitiesForMembershipDuesDraftForAllLibraries,
        getRecipients: getRecipientsForMembershipDuesDraftForAllLibraries,
        getOfferings: getOfferingsForMembershipDuesDraftForAllLibraries,
        getNotifications: getNotificationsForMembershipDuesDraftForAllLibraries
    };
    return membershipDuesAllLibrariesEstimatesDraft;
}

function generateDraftNotification(template, notificationData) {
    if ( !template || !notificationData ){
        throwErrorForBadData();
    }

    var offeringIds = notificationData.offeringIds;
    var recipientId = notificationData.recipientId;

    if ( notificationIsForLibraries() ) {
        if (notificationIsForAnnualAccessFeeInvoices()){
            if (isASingleRecipient()) {
                return getAnnualAccessFeeDraftForOneLibrary(template, notificationData);
            } else {
                return getAnnualAccessFeeDraftForAllLibraries(template, notificationData);
            }
        }
        else if (notificationIsForMembershipInGeneral(template.id)) {
            if (notificationIsEstimate()) {
                return getMembershipDuesEstimateDraftForAllLibraries(template, notificationData);
            }
            else {
                return getMembershipDuesInvoiceDraftForAllLibraries(template, notificationData);
            }
        }
        else if (notificationIsReminder()) {
            return getReminder(template, notificationData);
        }
        else if (notificationIsInvoice()) {
            if (shouldSendEverythingToEveryone()) {
                return getLibraryInvoicesForAll(template, notificationData);
            } else if (doRecipientsComeFromOfferings()) {
                return getLibraryInvoicesForSome(template, notificationData);
            } else if (isASingleRecipient()) {
                return getLibraryInvoicesForOne(template, notificationData);
            }
        }
        else if (notificationIsEstimate()) {
            if (shouldSendEverythingToEveryone()) {
                return getLibraryEstimatesForAll(template, notificationData);
            }
        }
    }
    else if (notificationIsForVendorReport()) {
        if (shouldSendEverythingToEveryone()) {
            return getVendorReportsForAll(template, notificationData);
        } else if (doRecipientsComeFromOfferings()) {
            return getVendorReportsForSome(template, notificationData);
        } else if (isASingleRecipient()) {
            return getVendorReportsForOne(template, notificationData);
        }
    }
    else {
        throwErrorForBadData();
    }

    function notificationIsForAnnualAccessFeeInvoices(){
        return isAnnualAccessFeeInvoice(template.id);
    }
    function notificationIsReminder() {
        return notificationRepository.notificationTypeIsForReminder(template.notificationType);
    }
    function notificationIsInvoice(){
        return notificationRepository.notificationTypeIsForInvoice(template.notificationType);
    }
    function notificationIsEstimate(){
        return notificationRepository.notificationTypeIsForEstimate(template.notificationType);
    }
    function shouldSendEverythingToEveryone() {
        return doRecipientsComeFromOfferings() && isNotificationAboutAllOfferings();
    }
    function isNotificationAboutAllOfferings() {
        return !offeringIds;
    }
    function isASingleRecipient() {
        return recipientId;
    }
    function doRecipientsComeFromOfferings() {
        return !recipientId;
    }
    function notificationIsForLibraries() {
        return notificationRepository.notificationTypeIsForLibrary(template.notificationType);
    }
    function notificationIsForVendorReport() {
        return notificationRepository.notificationTypeIsForVendor(template.notificationType);
    }
    function throwErrorForBadData(){
        throw new Error('Bad data for generating notification drafts');
    }
}

function isAnnualAccessFeeInvoice(templateId) {
    return notificationRepository.templateIsForAnnualAccessFeeInvoice(templateId);
}

function notificationIsForMembershipInGeneral(templateId) {
    return notificationRepository.templateIsForMembershipDues(templateId);
}

function isMembershipDuesInvoice(templateId){
    return notificationRepository.templateIsForMembershipInvoices(templateId);
}

function convertEntityToRecipient(entity, template) {
    return {
        id: entity.id,
        label: notificationRepository.getRecipientLabel(entity.name, template.notificationType)
    };
}

function discardDuplicateIds(value, index, self) {
    return self.indexOf(value) === index;
}

function generateNotificationForLibrary(libraryId, offeringsForAll, customizedTemplate, batchId, saveOfferingIdsToNotification){
    var notificationPromise = Q();
    var notification = generateNotificationForEntity(libraryId.toString(), customizedTemplate);
    var offeringsForLibrary = null;

    if ( offeringsForAll && offeringsForAll.length ){
        notification.cycle = offeringsForAll[0].cycle;
        offeringsForLibrary = offeringsForAll.filter(onlyOfferingsForLibrary);

        if ( offeringsForLibrary.length && saveOfferingIdsToNotification ){
            notification.offeringIds = idsFromOfferings(offeringsForLibrary);
        }

        var summaryTotal = notificationRepository.getSummaryFundedTotal(notification, offeringsForLibrary);
        if ( typeof summaryTotal === 'number' ){
            notification.summaryTotal = summaryTotal;
        }
    }

    if ( notification.isFeeInvoice ){
        notification.cycle = config.oneTimePurchaseProductsCycleDocId;
    }

    if ( notificationShouldHavePdfLink() ){
        notification.pdfLink = pdfLink();
    }

    if ( notificationNeedsInvoiceNumbers() ){
        notificationPromise = getInvoiceNumbers();
    }

    return notificationPromise.thenResolve(notification);


    function onlyOfferingsForLibrary(offering){
        return typeof offering.library == 'string' ? offering.library == libraryId : offering.library.id  == libraryId;
    }

    function notificationShouldHavePdfLink(){
        return customizedTemplate.notificationType === 'invoice' || customizedTemplate.notificationType === 'estimate';
    }

    function notificationNeedsInvoiceNumbers(){
        return customizedTemplate.notificationType === 'invoice';
    }

    function pdfLink(){
        return '/pdf/content/' + notification.id;
    }

    function getInvoiceNumbers(){
        return invoiceNumbers.generateNextInvoiceNumber()
            .then(addInvoiceNumberAndBatchIdToNotification);

        function addInvoiceNumberAndBatchIdToNotification(invoiceNumber){
            notification.batchId = batchId;
            notification.invoiceNumber = invoiceNumber;
            return notification;
        }
    }
}

function generateNotificationForVendor(vendorId, offeringsForAll, customizedTemplate, saveOfferingIdsToNotification){
    var notification = generateNotificationForEntity(vendorId, customizedTemplate);
    var offeringsForVendor = null;

    if ( offeringsForAll && offeringsForAll.length ){
        notification.cycle = offeringsForAll[0].cycle;
        offeringsForVendor = offeringsForAll.filter(onlyOfferingsForVendor);

        if ( offeringsForVendor.length && saveOfferingIdsToNotification ){
            notification.offeringIds = idsFromOfferings(offeringsForVendor);
        }

        var summaryTotal = notificationRepository.getSummaryTotal(notification, offeringsForVendor);
        if ( typeof summaryTotal === 'number' ){
            notification.summaryTotal = summaryTotal;
        }
    }

    notification.csvLink = csvLink();

    return notification;

    function onlyOfferingsForVendor(offering){
        return offering.product.vendor === vendorId;
    }

    function csvLink(){
        return '/csv/export/' + notification.id;
    }
}


function generateNotificationForEntity(entityId, customizedTemplate){
    return {
        id: uuid.v4(),
        type: 'Notification',
        targetEntity: entityId,
        subject: customizedTemplate.subject,
        emailBody: customizedTemplate.emailBody,
        draftStatus: 'draft',
        notificationType: customizedTemplate.notificationType,
        isFeeInvoice: isAnnualAccessFeeInvoice(customizedTemplate.templateId),
        isMembershipDuesInvoice: isMembershipDuesInvoice(customizedTemplate.templateId),
        isMembershipDuesEstimate: isMembershipDuesEstimate()
    };

    function isMembershipDuesEstimate(){
        return notificationRepository.templateIsForMembershipDues(customizedTemplate.templateId) &&
            notificationRepository.notificationTypeIsForEstimate(customizedTemplate.notificationType);
    }
}

function extractArrayOfIdsFromObject( mapObject ){
    return Object.keys(mapObject);
}

function idsFromOfferings(arrayOfOfferings){
    return arrayOfOfferings.map(function(offering){
        return offering.id;
    });
}

function filterOnlyPurchasedOfferings(offerings) {
    return offerings.filter(onlyPurchasedOfferings);
}
function onlyPurchasedOfferings(offering) {
    return offering.selection;
}
function filterOnlyPurchasedOfferingsWithFees(offerings) {
    return offerings.filter(onlyPurchasedOfferings).filter(onlyOfferingsWithFees);
}
function onlyOfferingsWithFees(offering) {
    return !!offering.oneTimePurchaseAnnualAccessFee;
}

function loadLibrariesWithSelectionsInCycle( cycleId ){
    return cycleRepository.load(cycleId)
        .then(function(cycle) {
            return libraryRepository.listLibrariesWithSelectionsInCycle(cycle);
        })
        .then(function (libraryIds) {
            return libraryRepository.getLibrariesById(libraryIds);
        });
}

module.exports = {
    generateDraftNotification: generateDraftNotification
};

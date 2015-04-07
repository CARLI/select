
var config = require('../../config');
var cycleRepository = require('../Entity/CycleRepository');
var libraryRepository = require('../Entity/LibraryRepository');
var notificationRepository = require('../Entity/NotificationRepository');
var offeringRepository = require('../Entity/OfferingRepository');
var productRepository = require('../Entity/ProductRepository');
var vendorRepository = require('../Entity/VendorRepository');
var Q = require('q');

function getAnnualAccessFeeDraftForOneLibrary(template, notificationData) {

    function getEntitiesForAnnualAccessFeeDraftForOneLibrary() {
        return libraryRepository.load(notificationData.recipientId);
    }
    function getRecipientsForAnnualAccessFeeDraftForOneLibrary() {
        return annualAccessOneLibraryDraft.getEntities()
            .then(function( libraryFromNotificationData ) {
                return libraryFromNotificationData.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });
    }
    function getOfferingsForAnnualAccessFeeDraftForOneLibrary() {
        return cycleRepository.load(config.oneTimePurchaseProductsCycleDocId).then(function (cycle) {
            return offeringRepository.listOfferingsForLibraryId(notificationData.recipientId, cycle);
        });
    }
    function getNotificationsForAnnualAccessFeeDraftForOneLibrary( customizedTemplate, actualRecipientIds ){
        return annualAccessOneLibraryDraft.getOfferings()
            .then(function(offerings) {
                return offerings.filter(onlyPurchasedOfferings);
            })
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForLibrary(id, offerings, customizedTemplate);
               });
            });
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
        return cycleRepository.load(config.oneTimePurchaseProductsCycleDocId)
            .then(function(cycle){
                return libraryRepository.listLibrariesWithSelectionsInCycle(cycle);
            })
            .then(function(libraryIdsAsStrings){
                var libraryIds = libraryIdsAsStrings.map(convertIdsToNumbers);

                return libraryRepository.getLibrariesById(libraryIds);
            });

        function convertIdsToNumbers(id) {
            return typeof id === 'number' ? id : parseInt(id, 10);
        }
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
            .then(function(offerings) {
                return offerings.filter(onlyPurchasedOfferings);
            })
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForLibrary(id, offerings, customizedTemplate);
                });
            });
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
        return libraryRepository.list();
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
        var notifications = actualRecipientIds.map(function(id){
            return generateNotificationForLibrary(id, null, customizedTemplate);
        });
        return Q(notifications);
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
            });
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
        return someVendorsDraft.getOfferings()
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForVendor(id, offerings, customizedTemplate);
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
        return libraryRepository.list();
    }
    function getRecipientsForLibraryInvoicesForAll() {
        return allLibrariesDraft.getEntities()
            .then(function( librariesWithSelectionsInCycle ) {
                return librariesWithSelectionsInCycle.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }
    function getOfferingsForLibraryInvoicesForAll(){}
    function getNotificationsForLibraryInvoicesForAll(){}

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
        var id = offering.library.id;
        return typeof id === 'number' ? id : parseInt(id, 10);
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
        return cycleRepository.load(notificationData.cycleId).then(function (cycle) {
            return offeringRepository.getOfferingsById(notificationData.offeringIds, cycle);
        });
    }

    function getNotificationsForLibraryInvoicesForSome(customizedTemplate, actualRecipientIds){
        return someLibrariesDraft.getOfferings()
            .then(function(offerings) {
                return offerings.filter(onlyPurchasedOfferings);
            })
            .then(function(offerings){
                return actualRecipientIds.map(function(id){
                    return generateNotificationForLibrary(id, offerings, customizedTemplate);
                });
            });
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
function getLibraryInvoicesForOne(template, notificationData) {

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
    function getOfferingsForLibraryInvoicesForOne(){}
    function getNotificationsForLibraryInvoicesForOne(){}

    var oneLibraryDraft = {
        getAudienceAndSubject: function() { return 'One Library, All Products'; },
        getEntities: getEntitiesForLibraryInvoicesForOne,
        getRecipients: getRecipientsForLibraryInvoicesForOne,
        getOfferings: getOfferingsForLibraryInvoicesForOne,
        getNotifications: getNotificationsForLibraryInvoicesForOne
    };
    return oneLibraryDraft;
}


function generateDraftNotification(template, notificationData) {
    var offeringIds = notificationData.offeringIds;
    var recipientId = notificationData.recipientId;

    if (isAnnualAccessFeeInvoice()) {
        if (isASingleRecipient()) {
            return getAnnualAccessFeeDraftForOneLibrary(template, notificationData);
        } else {
            return getAnnualAccessFeeDraftForAllLibraries(template, notificationData);
        }
    } else if (isReminder()) {
        return getReminder(template, notificationData);
    } else if (notificationTypeIsForVendor()) {
        if (shouldSendEverythingToEveryone()) {
            return getVendorReportsForAll(template, notificationData);
        } else if (doRecipientsComeFromOfferings()) {
            return getVendorReportsForSome(template, notificationData);
        } else if (isASingleRecipient()) {
            return getVendorReportsForOne(template, notificationData);
        }
    } else if (notificationTypeIsForLibrary()) {
        if (shouldSendEverythingToEveryone()) {
            return getLibraryInvoicesForAll(template, notificationData);
        } else if (doRecipientsComeFromOfferings()) {
            return getLibraryInvoicesForSome(template, notificationData);
        } else if (isASingleRecipient()) {
            return getLibraryInvoicesForOne(template, notificationData);
        }
    }

    function isAnnualAccessFeeInvoice() {
        return template.id === 'notification-template-annual-access-fee-invoices';
    }
    function isReminder() {
        return template.id === 'notification-template-contact-non-players' ||
            template.id === 'notification-template-library-reminder';
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
    function notificationTypeIsForLibrary() {
        return notificationRepository.notificationTypeIsForLibrary(template.notificationType);
    }
    function notificationTypeIsForVendor() {
        return notificationRepository.notificationTypeIsForVendor(template.notificationType);
    }
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

function generateNotificationForLibrary(libraryId, offerings, customizedTemplate){
    var notification = generateNotificationForEntity(libraryId, customizedTemplate);

    if ( offerings && offerings.length ){
        notification.offerings = offerings.filter(onlyOfferingsForLibrary);
        notification.cycle = offerings[0].cycle;
    }

    return notification;

    function onlyOfferingsForLibrary(offering){
        return offering.library.id === libraryId;
    }
}

function generateNotificationForVendor(vendorId, offerings, customizedTemplate){
    var notification = generateNotificationForEntity(vendorId, customizedTemplate);

    if ( offerings && offerings.length ){
        notification.offerings = offerings.filter(onlyOfferingsForVendor);
        notification.cycle = offerings[0].cycle;
    }

    return notification;

    function onlyOfferingsForVendor(offering){
        return offering.product.vendor === vendorId;
    }
}


function generateNotificationForEntity(entityId, customizedTemplate){
    return {
        type: 'Notification',
        targetEntity: entityId,
        subject: customizedTemplate.subject,
        emailBody: customizedTemplate.emailBody,
        pdfBody: customizedTemplate.pdfBody,
        draftStatus: 'draft',
        notificationType: customizedTemplate.notificationType
    };
}

function extractArrayOfIdsFromObject( mapObject ){
    return Object.keys(mapObject);
}

function onlyPurchasedOfferings(offering) {
    return offering.selection;
}

module.exports = {
    generateDraftNotification: generateDraftNotification
};

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
                    return generateNotificationForEntity(id, offerings, customizedTemplate);
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
                    return generateNotificationForEntity(id, offerings, customizedTemplate);
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
        console.log(notificationData.cycleId);
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
    function getOfferingsForReminder(){}
    function getNotificationsForReminder(){}

    var reminderDraft = {
        getAudienceAndSubject: function() { return 'Reminder'; },
        getLibrariesWithSelections: getLibrariesWithSelections,
        getAllLibraries: getAllLibraries,
        getRecipients: getRecipientsForReminder,
        getOfferings: getOfferingsForReminder,
        getNotifications: getNotificationsForReminder
    };

    return reminderDraft;
}

function getVendorReportsForAll(template, notificationData) {

    function getEntitiesForVendorReportsForAll() {
        return cycleRepository.load(notificationData.cycleId)
            .then(function(cycle) {
                return productRepository.listProductCountsByVendorId(cycle)
                    .then(function (productsByVendorId) {
                        return Object.keys(productsByVendorId);
                    })
                    .then(vendorRepository.getVendorsById);
            });
    }
    function getRecipientsForVendorReportsForAll() {
        return allVendorsDraft.getEntities()
            .then(function( vendorsWithProductsInCycle ) {
                return vendorsWithProductsInCycle.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }
    function getOfferingsForVendorReportsForAll(){}
    function getNotificationsForVendorReportsForAll(){}

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
        return cycleRepository.load(notificationData.cycleId).then(function (cycle) {
            return getOfferingsFromCycle()
                .then(getProductsFromOfferings)
                .then(getVendorsFromProducts);

            function getOfferingsFromCycle() {
                return offeringRepository.getOfferingsById(notificationData.offeringIds, cycle);
            }
            function getProductsFromOfferings(offerings) {
                var productIds = offerings.map(getProductIdFromOffering);
                return productRepository.getProductsById(productIds, cycle);

                function getProductIdFromOffering(offering) {
                    return offering.product;
                }
            }
            function getVendorsFromProducts(products) {
                var vendorIds = products.map(getVendorIdFromProduct).filter(discardDuplicateIds);
                return vendorRepository.getVendorsById(vendorIds);

                function getVendorIdFromProduct(product) {
                    return product.vendor;
                }
            }
        });
    }
    function getOfferingsForVendorReportsForSome(){}
    function getNotificationsForVendorReportsForSome(){}

    function getRecipientsForVendorReportsForSome() {
        return someVendorsDraft.getEntities()
            .then(function( vendorsFromSelectedOfferings ) {
                return vendorsFromSelectedOfferings.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
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
    function getOfferingsForVendorReportsForOne(){}
    function getNotificationsForVendorReportsForOne(){}

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
                    console.log(id);
                    return generateNotificationForEntity(id, offerings, customizedTemplate);
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

function generateNotificationForEntity(entityId, offerings, customizedTemplate){
    return {
        type: 'Notification',
        targetEntity: entityId,
        subject: customizedTemplate.subject,
        emailBody: customizedTemplate.emailBody,
        pdfBody: customizedTemplate.pdfBody,
        cycle: offerings[0].cycle,
        offerings: offerings.filter(onlyOfferingsForEntity),
        draftStatus: 'draft',
        notificationType: customizedTemplate.notificationType
    };

    function onlyOfferingsForEntity(offering){
        console.log(offering.library.id, entityId);
        return offering.library.id === entityId;
    }
}


function onlyPurchasedOfferings(offering) {
    return offering.selection;
}

module.exports = {
    generateDraftNotification: generateDraftNotification
};

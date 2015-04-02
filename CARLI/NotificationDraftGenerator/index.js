
var cycleRepository = require('../Entity/CycleRepository');
var libraryRepository = require('../Entity/LibraryRepository');
var notificationRepository = require('../Entity/NotificationRepository');
var offeringRepository = require('../Entity/OfferingRepository');
var productRepository = require('../Entity/ProductRepository');
var vendorRepository = require('../Entity/VendorRepository');
var Q = require('q');

function getAnnualAccessFeeDraftForOneLibrary(template, notificationData) {
    function getEntitiesForAnnualAccessFeeDraftForOneLibrary() {}
    function getRecipientsForAnnualAccessFeeDraftForOneLibrary() {}

    var annualAccessOneLibraryDraft = {
        getAudienceAndSubject: function() { return 'One Library, Annual Access Fee'; },
        getEntities: getEntitiesForAnnualAccessFeeDraftForOneLibrary,
        getRecipients: getRecipientsForAnnualAccessFeeDraftForOneLibrary
    };
    return annualAccessOneLibraryDraft;
}
function getAnnualAccessFeeDraftForAllLibraries(template, notificationData) {
    function getEntitiesForAnnualAccessFeeDraftForAllLibraries() {}
    function getRecipientsForAnnualAccessFeeDraftForAllLibraries() {}

    var annualAccessAllLibrariesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, Annual Access Fee'; },
        getEntities: getEntitiesForAnnualAccessFeeDraftForAllLibraries,
        getRecipients: getRecipientsForAnnualAccessFeeDraftForAllLibraries
    };
    return annualAccessAllLibrariesDraft;
}
function getReminder(template, notificationData) {
    var cycleId = notificationData.cycleId;

    function getEntitiesForReminder() {
        return cycleRepository.load(cycleId)
            .then(function(cycle){
                return Q.all([
                    libraryRepository.listLibrariesWithSelectionsInCycle(cycle),
                    libraryRepository.list()
                ]);
            })
            .then(function(arrayOfPromises){
                return {
                    librariesWithSelectionsInCycle: arrayOfPromises[0],
                    allLibraries: arrayOfPromises[1]
                };
            });
    }

    function getRecipientsForReminder() {
        return reminderDraft.getEntities()
            .then(function( entityResults ) {
                return listLibrariesThatHaveNotMadeSelections(entityResults.librariesWithSelectionsInCycle, entityResults.allLibraries);
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

    var reminderDraft = {
        getAudienceAndSubject: function() { return 'Reminder'; },
        getEntities: getEntitiesForReminder,
        getRecipients: getRecipientsForReminder
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
                    .then(vendorRepository.getVendorsById)
                    .then(function (vendors) {
                        return {
                            vendorsWithProductsInCycle: vendors
                        }
                    });
            });
    }
    function getRecipientsForVendorReportsForAll() {
        return allVendorsDraft.getEntities()
            .then(function( entityResults ) {
                return entityResults.vendorsWithProductsInCycle.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    var allVendorsDraft = {
        getAudienceAndSubject: function() { return 'All Vendors, All Products'; },
        getEntities: getEntitiesForVendorReportsForAll,
        getRecipients: getRecipientsForVendorReportsForAll
    };
    return allVendorsDraft;
}
function getVendorReportsForSome(template, notificationData) {
    function getEntitiesForVendorReportsForSome() {
        return cycleRepository.load(notificationData.cycleId).then(function (cycle) {
            return getOfferingsFromCycle()
                .then(getProductsFromOfferings)
                .then(getVendorsFromProducts)
                .then(function (vendors) {
                    return {
                        vendorsFromSelectedOfferings: vendors
                    }
                });

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

    function getRecipientsForVendorReportsForSome() {
        return someVendorsDraft.getEntities()
            .then(function( entityResults ) {
                console.log(entityResults);

                return entityResults.vendorsFromSelectedOfferings.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    var someVendorsDraft = {
        getAudienceAndSubject: function() { return 'One or more Vendors, One or more Products'; },
        getEntities: getEntitiesForVendorReportsForSome,
        getRecipients: getRecipientsForVendorReportsForSome
    };
    return someVendorsDraft;
}
function getVendorReportsForOne(template, notificationData) {
    function getEntitiesForVendorReportsForOne() {
        return vendorRepository.load(notificationData.recipientId).then(function(vendor) {
            return { vendorFromNotificationData: [ vendor ] };
        });
    }
    function getRecipientsForVendorReportsForOne() {
        return oneVendorDraft.getEntities()
            .then(function( entityResults ) {
                return entityResults.vendorFromNotificationData.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    var oneVendorDraft = {
        getAudienceAndSubject: function() { return 'One Vendor, All Products'; },
        getEntities: getEntitiesForVendorReportsForOne,
        getRecipients: getRecipientsForVendorReportsForOne
    };
    return oneVendorDraft;
}
function getLibraryInvoicesForAll(template, notificationData) {
    function getEntitiesForLibraryInvoicesForAll() {
        return libraryRepository.list().then(function(libraries){
            return {
                librariesWithSelectionsInCycle: libraries
            }
        });
    }
    function getRecipientsForLibraryInvoicesForAll() {
        return allLibrariesDraft.getEntities()
            .then(function( entityResults ) {
                return entityResults.librariesWithSelectionsInCycle.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    var allLibrariesDraft = {
        getAudienceAndSubject: function() { return 'All Libraries, All Products'; },
        getEntities: getEntitiesForLibraryInvoicesForAll,
        getRecipients: getRecipientsForLibraryInvoicesForAll
    };
    return allLibrariesDraft;
}
function getLibraryInvoicesForSome(template, notificationData) {
    function getEntitiesForLibraryInvoicesForSome() {
        return cycleRepository.load(notificationData.cycleId).then(function (cycle) {
            return offeringRepository.getOfferingsById(notificationData.offeringIds, cycle).then(function(offerings) {
                var libraryIds = offerings.map(getLibraryIdFromOffering).filter(discardDuplicateIds);
                return libraryRepository.getLibrariesById(libraryIds).then(function (libraries) {
                    return {
                        librariesFromOfferings: libraries
                    }
                });
            });
        });
    }
    function getLibraryIdFromOffering(offering) {
        var id = offering.library;
        return typeof id === 'number' ? id : parseInt(id, 10);
    }

    function getRecipientsForLibraryInvoicesForSome() {
        return someLibrariesDraft.getEntities()
            .then(function( entityResults ) {
                return entityResults.librariesFromOfferings.map(function(vendor) {
                    return convertEntityToRecipient(vendor, template);
                });
            });
    }

    var someLibrariesDraft = {
        getAudienceAndSubject: function() { return 'One or more Libraries, One or more Products'; },
        getEntities: getEntitiesForLibraryInvoicesForSome,
        getRecipients: getRecipientsForLibraryInvoicesForSome
    };
    return someLibrariesDraft;
}
function getLibraryInvoicesForOne(template, notificationData) {
    function getEntitiesForLibraryInvoicesForOne() {
        return libraryRepository.load(notificationData.recipientId).then(function (library) {
            return {
                libraryFromNotificationData: [ library ]
            }
        });
    }
    function getRecipientsForLibraryInvoicesForOne() {
        return oneLibraryDraft.getEntities()
            .then(function( entityResults ) {
                return entityResults.libraryFromNotificationData.map(function(library) {
                    return convertEntityToRecipient(library, template);
                });
            });
    }

    var oneLibraryDraft = {
        getAudienceAndSubject: function() { return 'One Library, All Products'; },
        getEntities: getEntitiesForLibraryInvoicesForOne,
        getRecipients: getRecipientsForLibraryInvoicesForOne
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
        var results = {
            'invoice': true,
            'report': false,
            'subscription': true
        };
        return results[template.notificationType];
    }
    function notificationTypeIsForVendor() {
        var results = {
            'invoice': false,
            'report': true,
            'subscription': false
        };
        return results[template.notificationType];
    }
}

function convertEntityToRecipient(entity, template) {
    return {
        value: entity.id,
        label: notificationRepository.getRecipientLabel(entity.name, template.notificationType)
    };
}

function discardDuplicateIds(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = {
    generateDraftNotification: generateDraftNotification
};

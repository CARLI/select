
var cycleRepository = require('../Entity/CycleRepository');
var libraryRepository = require('../Entity/LibraryRepository');
var notificationRepository = require('../Entity/NotificationRepository');
var Q = require('q');

function getAnnualAccessFeeDraftForOneLibrary() {
    return {
        getAudienceAndSubject: function() { return 'One Library, Annual Access Fee'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getAnnualAccessFeeDraftForAllLibraries() {
    return {
        getAudienceAndSubject: function() { return 'All Libraries, Annual Access Fee'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getReminderDraft(template, notificationData) {
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
                return librariesToContact.map(convertEntityToRecipient);
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
function getVendorReportsForAll() {
    return {
        getAudienceAndSubject: function() { return 'All Vendors, All Products'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getVendorReportsForSome() {
    return {
        getAudienceAndSubject: function() { return 'One or more Vendors, One or more Products'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getVendorReportsForOne() {
    return {
        getAudienceAndSubject: function() { return 'One Vendor, All Products'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getLibraryInvoicesForAll() {
    return {
        getAudienceAndSubject: function() { return 'All Libraries, All Products'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getLibraryInvoicesForSome() {
    return {
        getAudienceAndSubject: function() { return 'One or more Libraries, One or more Products'; },
        getRecipients: function() {
            //TODO
        }
    };
}
function getLibraryInvoicesForOne() {
    return {
        getAudienceAndSubject: function() { return 'One Library, All Products'; },
        getRecipients: function() {
            //TODO
        }
    };
}


function generateDraftNotification(template, notificationData) {
    var offeringIds = notificationData.offeringIds;
    var recipientId = notificationData.recipientId;

    if (isAnnualAccessFeeInvoice()) {
        if (isASingleRecipient()) {
            return getAnnualAccessFeeDraftForOneLibrary();
        } else {
            return getAnnualAccessFeeDraftForAllLibraries();
        }
    } else if (isReminder()) {
        return getReminderDraft(template, notificationData);
    } else if (notificationTypeIsForVendor()) {
        if (shouldSendEverythingToEveryone()) {
            return getVendorReportsForAll();
        } else if (doRecipientsComeFromOfferings()) {
            return getVendorReportsForSome();
        } else if (isASingleRecipient()) {
            return getVendorReportsForOne();
        }
    } else if (notificationTypeIsForLibrary()) {
        if (shouldSendEverythingToEveryone()) {
            return getLibraryInvoicesForAll();
        } else if (doRecipientsComeFromOfferings()) {
            return getLibraryInvoicesForSome();
        } else if (isASingleRecipient()) {
            return getLibraryInvoicesForOne();
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

function convertEntityToRecipient( entity ){
    return {
        value: entity.id,
        label: notificationRepository.getRecipientLabel(entity.name, vm.template.notificationType)
    };
}

module.exports = {
    generateDraftNotification: generateDraftNotification
};

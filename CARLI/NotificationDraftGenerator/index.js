
function getAnnualAccessFeeDraftForOneLibrary() {
    return {
        getAudienceAndSubject: function() { return 'One Library, Annual Access Fee'; }
    };
}
function getAnnualAccessFeeDraftForAllLibraries() {
    return {
        getAudienceAndSubject: function() { return 'All Libraries, Annual Access Fee'; }
    };
}
function getReminderDraft() {
    return {
        getAudienceAndSubject: function() { return 'Reminder'; }
    };
}
function getVendorReportsForAll() {
    return {
        getAudienceAndSubject: function() { return 'All Vendors, All Products'; }
    };
}
function getVendorReportsForSome() {
    return {
        getAudienceAndSubject: function() { return 'One or more Vendors, One or more Products'; }
    };
}
function getVendorReportsForOne() {
    return {
        getAudienceAndSubject: function() { return 'One Vendor, All Products'; }
    };
}
function getLibraryInvoicesForAll() {
    return {
        getAudienceAndSubject: function() { return 'All Libraries, All Products'; }
    };
}
function getLibraryInvoicesForSome() {
    return {
        getAudienceAndSubject: function() { return 'One or more Libraries, One or more Products'; }
    };
}
function getLibraryInvoicesForOne() {
    return {
        getAudienceAndSubject: function() { return 'One Library, All Products'; }
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
        return getReminderDraft();
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


module.exports = {
    generateDraftNotification: generateDraftNotification
};

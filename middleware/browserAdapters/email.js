var middlewareRequest = require('./middlewareRequest');

function sendNotificationEmail(notificationId) {
    return middlewareRequest({
        path: '/send-notification-email/' + notificationId,
        method: 'post'
    });
}

function sendOneTimePurchaseMessage(offeringId){
    return middlewareRequest({
        path: '/notify-carli-of-one-time-purchase/' + offeringId,
        method: 'post'
    });
}

function sendIpAddressChangeNotification(libraryId) {
    return middlewareRequest({
        path: '/notify-carli-of-ip-address-change/' + libraryId,
        method: 'post'
    });
}

function sendVendorDoneEnteringPricingMessage(vendorId){
    return middlewareRequest({
        path: '/notify-carli-of-vendor-done-entering-pricing/' + vendorId,
        method: 'post'
    });
}

function sendAskCarliMessage(messageObject){
    return middlewareRequest({
        path: '/ask-carli',
        method: 'post',
        json: true,
        body: messageObject
    });
}

module.exports = {
    tellPixobot: function () {},
    sendNotificationEmail: sendNotificationEmail,
    sendOneTimePurchaseMessage: sendOneTimePurchaseMessage,
    sendIpAddressChangeNotification: sendIpAddressChangeNotification,
    sendVendorDoneEnteringPricingMessage: sendVendorDoneEnteringPricingMessage,
    sendAskCarliMessage: sendAskCarliMessage
};

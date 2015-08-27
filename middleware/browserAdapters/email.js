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

module.exports = {
    tellPixobot: function () {},
    sendNotificationEmail: sendNotificationEmail,
    sendOneTimePurchaseMessage: sendOneTimePurchaseMessage
};
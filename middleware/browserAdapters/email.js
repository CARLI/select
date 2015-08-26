var middlewareRequest = require('./middlewareRequest');

function sendNotificationEmail(notificationId) {
    return middlewareRequest({
        path: '/send-notification-email/' + notificationId,
        method: 'post'
    });
}

function sendOneTimePurchaseMessage(productId, libraryId){
    return middlewareRequest({
        path: '/notify-carli-of-one-time-purchase/' + productId + '/by/' + libraryId,
        method: 'post'
    });
}

module.exports = {
    tellPixobot: function () {},
    sendNotificationEmail: sendNotificationEmail,
    sendOneTimePurchaseMessage: sendOneTimePurchaseMessage
};
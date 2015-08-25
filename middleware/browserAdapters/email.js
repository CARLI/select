var middlewareRequest = require('./middlewareRequest');

function sendNotificationEmail(notificationId) {
    return middlewareRequest({
        path: '/send-notification-email/' + notificationId,
        method: 'post'
    });
}

module.exports = {
    tellPixobot: function () {},
    sendNotificationEmail: sendNotificationEmail
};
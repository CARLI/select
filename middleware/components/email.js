var config = require('../../config');
var handlebars = require('handlebars');
var mailer = require('nodemailer');
var mailTransport = mailer.createTransport(null);
var notificationRepository = require('../../CARLI/Entity/NotificationRepository.js');
var Q = require('q');
var request = require('request');

function tellPixobot(envelope) {
    if (typeof envelope === 'string') {
        envelope = { message: envelope };
    }
    request({
        url: 'http://pixobot.herokuapp.com/hubot/message-room/37097_carli@conf.hipchat.com',
        method: 'post',
        json: envelope
    });
}

function sendTemplatedMessage(to, subject, template, variables ){
    var realTo = config.notifications.overrideTo ? config.notifications.overrideTo : to;
    var emailBodyText = fillTemplate(template, variables);

    var options = {
        to: realTo,
        from: config.notifications.from,
        subject: subject,
        text: emailBodyText
    };

    return sendMail(options);

    function fillTemplate(template, variables) {
        var compiled = handlebars.compile(template);
        return compiled(variables);
    }
}

function sendPasswordResetMessage(to, template, variables) {
    var resetSubject = 'Reset your CARLI Select password';
    return sendTemplatedMessage(to, resetSubject, template, variables);
}

function sendNotificationEmail( notificationId ){
    return notificationRepository.load(notificationId)
        .then(function(notification){
            var options = {
                to: config.notifications.overrideTo ? config.notifications.overrideTo : notification.to,
                from: notification.ownerEmail,
                subject: notification.subject,
                text: notification.emailBody
                //TODO: PDF / CSV attachment
            };
            return sendMail(options);
        });
}


function sendMail(options) {
    var deferred = Q.defer();
    mailTransport.sendMail(options, sendMailCallback);
    return deferred;

    function sendMailCallback(err, info) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(info);
    }
    //mailTransport.sendMail({
    //    from: 'yoda@pixotech.com',
    //    to: 'carli@pixotech.com',
    //    subject: 'May the force be with you',
    //    text: 'Easy, sending email from node is.',
    //});
}

module.exports = {
    tellPixobot: tellPixobot,
    sendTemplatedMessage: sendTemplatedMessage,
    sendPasswordResetMessage: sendPasswordResetMessage,
    sendNotificationEmail: sendNotificationEmail
};

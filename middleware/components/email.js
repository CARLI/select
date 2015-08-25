var handlebars = require('handlebars');
var mailer = require('nodemailer');
var mailTransport = mailer.createTransport(null);
var Q = require('q');
var request = require('request');

var config = require('../../config');

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

function sendNotification(to, template, variables) { //sendTemplatedMessage
    var realTo = config.notifications.overrideTo ? config.notifications.overrideTo : to;
    var emailBodyText = fillTemplate(template, variables);

    var options = {
        from: config.notifications.from,
        to: realTo,
        subject: 'Reset your CARLI Select password',
        text: emailBodyText
    };

    return sendMail(options);
}

function fillTemplate(template, variables) {
    var compiled = handlebars.compile(template);
    return compiled(variables);
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
    sendNotification: sendNotification
};

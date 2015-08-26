var config = require('../../config');
var handlebars = require('handlebars');
var mailer = require('nodemailer');
var mailTransport = mailer.createTransport(null);
var notificationRepository = require('../../CARLI/Entity/NotificationRepository.js');
var pdf = require('./pdf');
var Q = require('q');
var request = require('request');
var vendorReportCsv = require('./csv/vendorReport');

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
                bcc: notification.ownerEmail,
                from: notification.ownerEmail,
                subject: notification.subject,
                text: notification.emailBody,
                attachments: []
            };

            return includeAttachmentsIfNecessary( options, notification )
                .then(function() {
                    console.log('send email to '+notification.to);
                    return sendMail(options);
                })
                .catch(function(err){ console.log('EMAIL ERROR ', err); })
        });

    function includeAttachmentsIfNecessary( emailOptions, notification ){
        if ( notification.pdfLink ){
            console.log('  generating PDF to attach');
            return pdf.exportPdf(notification.id)
                .then(function(exportResults){
                    console.log('    attaching PDF '+exportResults.fileName);
                    emailOptions.attachments.push({
                        content: exportResults.pdf,
                        contentType: 'application/pdf',
                        filename: exportResults.fileName
                    });
                })
                .catch(function(err){ console.log('PDF ERROR ', err); })
        }
        else if ( notification.csvLink ) {
            console.log('  generating CSV to attach');
            return vendorReportCsv.exportCsvForVendorReport(notification.id)
                .then(function(exportResults){
                    console.log('    attaching CSV '+exportResults.fileName);
                    emailOptions.attachments.push({
                        content: exportResults.csv,
                        contentType: 'text/csv',
                        filename: exportResults.fileName
                    });
                })
                .catch(function(err){ console.log('CSV ERROR ', err); })
        }
        else {
            console.log('  no attachments');
            return Q(true);
        }
    }
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

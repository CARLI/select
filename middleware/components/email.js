var handlebars = require('handlebars');
var mailer = require('nodemailer');
var numeral = require('numeral');
var Q = require('q');
var request = require('request');

var config = require('../../config');
var cycleRepository = require('../../CARLI/Entity/CycleRepository.js');
var notificationRepository = require('../../CARLI/Entity/NotificationRepository.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var pdf = require('./pdf');
var vendorReportCsv = require('./csv/vendorReport');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository.js');

var smtpConfig = {
    host: process.env['SMTP_HOST'],
    port: process.env['SMTP_PORT'],
    secure: stringToBool(process.env['SMTP_SECURE']),
    ignoreTLS: stringToBool(process.env['SMTP_IGNORE_TLS']),
    requireTLS: stringToBool(process.env['SMTP_REQUIRE_TLS']),
    logger: true,
    debug: true,
};

if (process.env['SMTP_USER'] && process.env['SMTP_PASSWORD'])
    smtpConfig.auth = {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASSWORD'],
    };

function stringToBool(str) {
    if (str === undefined)
        return false;
    return str !== 'false';
}

var messageConfig = {
    notificationsOverrideTo: process.env['NOTIFICATIONS_OVERRIDE_TO'], //causes ALL emails to go to this address if set
    carliSupport: process.env['CARLI_SUPPORT_EMAIL'],
    carliListServe: process.env['CARLI_LISTSERVE_EMAIL']
};

var mailTransport;

if ( smtpConfig.host ) {
    Logger.log('EMAIL module config\n', smtpConfig, '\n', messageConfig);
    mailTransport = mailer.createTransport(smtpConfig);
}
else {
    Logger.log('EMAIL module: no smtp host defined, using default (local)');
    mailTransport = mailer.createTransport();
}

function getEmailAddress(originalAddress) {
    if ( messageConfig.notificationsOverrideTo )
        return messageConfig.notificationsOverrideTo;
    return originalAddress;
}

function sendTemplatedMessage(to, subject, template, variables ){
    var realTo = getEmailAddress(to);
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

function notifyCarliOfNewLibraryUser(template, variables) {
    var notifySubject = "New Select User for " + variables.library.name;
    var to = getEmailAddress(messageConfig.carliSupport);
    return sendTemplatedMessage(to, notifySubject, template, variables);
}

function sendNotificationEmail( notificationId ){
    return notificationRepository.load(notificationId)
        .then(function(notification){
            var options = {
                to: getEmailAddress(notification.to),
                bcc: notification.ownerEmail,
                from: config.notifications.from,
                replyTo: notification.ownerEmail,
                subject: notification.subject,
                text: notification.emailBody,
                attachments: []
            };

            return includeAttachmentsIfNecessary( options, notification )
                .then(function() {
                    Logger.log('send email to '+options.to);
                    return sendMail(options);
                })
                .catch(function(err){ Logger.log('EMAIL ERROR ', err); })
        });

    function includeAttachmentsIfNecessary( emailOptions, notification ){
        if ( notification.pdfLink ){
            Logger.log('  generating PDF to attach');
            return pdf.exportPdf(notification.id)
                .then(function(exportResults){
                    Logger.log('    attaching PDF '+exportResults.fileName);
                    emailOptions.attachments.push({
                        content: exportResults.pdf,
                        contentType: 'application/pdf',
                        filename: exportResults.fileName
                    });
                })
                .catch(function(err){ Logger.log('PDF ERROR ', err); })
        }
        else if ( notification.csvLink ) {
            Logger.log('  generating CSV to attach');
            return vendorReportCsv.exportCsvForVendorReport(notification.id)
                .then(function(exportResults){
                    Logger.log('    attaching CSV '+exportResults.fileName);
                    emailOptions.attachments.push({
                        content: exportResults.csv,
                        contentType: 'text/csv',
                        filename: exportResults.fileName
                    });
                })
                .catch(function(err){ Logger.log('CSV ERROR ', err); })
        }
        else {
            Logger.log('  no attachments');
            return Q(true);
        }
    }
}

function sendOneTimePurchaseMessage( offeringId ){
        return loadOneTimePurchaseCycle()
        .then(loadOffering)
        .then(function(offering){
            var realTo = getEmailAddress(messageConfig.carliListServe);

            var options = {
                to: realTo,
                from: config.notifications.from,
                subject: 'New One-Time Purchase Product Selection',
                text: messageText(offering)
            };

            return sendMail(options);
        });

    function loadOneTimePurchaseCycle(){
        return cycleRepository.load(config.oneTimePurchaseProductsCycleDocId);
    }

    function loadOffering(oneTimePurchaseCycle){
        return offeringRepository.load(offeringId, oneTimePurchaseCycle);
    }

    function messageText(offering){
        return offering.library.name + ' purchased ' +
               offering.product.name + ' for $' + formatCurrency(offeringRepository.getFundedSelectionPrice(offering));
    }
}

function sendIpAddressChangeNotification(libraryId) {
    return libraryRepository.load(libraryId).then(function (library) {
        var realTo = getEmailAddress(messageConfig.carliSupport);

        var options = {
            to: realTo,
            from: config.notifications.from,
            subject: 'IP Addresses Updated for ' + library.name,
            text: messageText(library)
        };

        return sendMail(options);
    });

    function messageText(library) {
        var text = library.name + ' has updated their IP address information.  The updated IP Address(es) are:'
            + "\n\n" + library.ipAddresses;

        if (library.previousIpAddresses && library.previousIpAddresses !== "")
            text = text + "\n\nUpdated from:\n\n" + library.previousIpAddresses;

        return text;
    }
}

function sendVendorDoneEnteringPricingMessage( vendorId ){
    return vendorRepository.load(vendorId)
        .then(function(vendor){
            var realTo = getEmailAddress(messageConfig.carliListServe);

            var options = {
                to: realTo,
                from: config.notifications.from,
                subject: 'Vendor ' + vendor.name + ' done entering prices',
                text: messageText(vendor)
            };

            return sendMail(options);
        });

    function messageText(vendor){
        return vendor.name + ' has indicated that their pricing has been completely entered for this cycle. ' +
        vendor.name + ' will be able to continue editing their prices until you take the step of closing the vendor pricing in the staff app.';
    }
}

function sendAskCarliMessage( message ){
    Logger.log('ask carli ', message);

    var messageText = message.text;
    var messageContext = message.context || '';
    var page = message.page || '';
    var userEmail = message.user.email;
    var userName = message.user.fullName;
    var libraryName = message.user.libraryName;
    var vendorName = message.user.vendorName;

    var fromName = libraryName || vendorName || '';
    if ( fromName ){
        fromName = ' from ' + fromName;
    }

    var realTo = getEmailAddress(messageConfig.carliSupport);

    var options = {
        to: realTo,
        from: userEmail,
        subject: 'ASK CARLI' + fromName + ' by ' + userName,
        text: messageBody()
    };

    return sendMail(options);

    function messageBody(){
        return userName + fromName + ' asks: \n\n' +
               messageText + '\n\n' +
              'They were on ' + page + ' when the message was sent, using the button near ' + messageContext;
    }
}

function sendMail(options) {
    var deferred = Q.defer();
    mailTransport.sendMail(options, sendMailCallback);
    return deferred.promise;

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

function sendTestEmail(sendTo) {
    if (!sendTo)
        sendTo = messageConfig.notificationsOverrideTo;
    if (!sendTo) {
        console.log("Unable to send test email because I don't know who to send it to.");
        console.log("If the NOTIFICATIONS_OVERRIDE_TO environment variable was set, I would have used that.");
        return;
    }

    var options = {
        to: sendTo,
        from: config.notifications.from,
        subject: 'CARLI Select Email Test',
        text: messageBody()
    };

    return sendMail(options);

    function messageBody(){
        return 'Hello World.\n\n' +
            'Sincerely,\n' +
            'The CARLI Select Software';
    }
}

function formatCurrency( number ){
    return numeral(number).format('0,0.00');
}

module.exports = {
    sendTemplatedMessage: sendTemplatedMessage,
    sendTestEmail: sendTestEmail,
    sendPasswordResetMessage: sendPasswordResetMessage,
    sendNotificationEmail: sendNotificationEmail,
    sendOneTimePurchaseMessage: sendOneTimePurchaseMessage,
    sendIpAddressChangeNotification: sendIpAddressChangeNotification,
    sendVendorDoneEnteringPricingMessage: sendVendorDoneEnteringPricingMessage,
    sendAskCarliMessage: sendAskCarliMessage,
    notifyCarliOfNewLibraryUser: notifyCarliOfNewLibraryUser
};

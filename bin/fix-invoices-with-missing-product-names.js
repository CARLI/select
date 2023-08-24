#!/usr/bin/env node

var Q = require('q');

var cli = require('../CARLI/CommandLine');
var config = require('../config');
var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var notificationRepository = require('../CARLI/Entity/NotificationRepository');
var pdf = require('../middleware/components/pdf/index');

cli.asCouchAdmin(async function() {
    await fixNotificationsMissingProductName()
});

async function fixNotificationsMissingProductName() {
    // NOTE: Add the notification IDs that need to be fixed here
    // NOTE: also looks like you need to change the templates directory to middleware/components instead of components in middleware/components/pdf/index.js
    const notificationsToFix = [
    ];

    console.log(`Fixing ${notificationsToFix.length} notifications`);

    for (const notification of notificationsToFix) {

        console.log(`Fixing notification ${notification}`);

        await fixNotification(notification);

        console.log(`    Fixed notification ${notification}`);
    }
}

async function fixNotification(notificationId) {
    const notification = await notificationRepository.load(notificationId);
    notification.dataForPdf = null;
    await notificationRepository.update(notification);

    await pdf.contentForPdf(notificationId);
}

function filterNotifications(notifications) {
    console.log(`Found ${notifications.length} notifications`);

    return notifications.filter(notification => {
        return !!notification.dataForPdf && !!notification.dataForPdf.invoiceData ? notification.dataForPdf.invoiceData.some(invoice => !invoice.product) : false;
    });
}

function logNotifications(notifications) {
    console.log(`Found ${notifications.length} notifications missing product name`);

    notifications.forEach(notification => {
        console.log(`    ID: ${notification.id}, Library: ${notification.dataForPdf.library.name}, Cycle: ${notification.dataForPdf.cycle.name}`);
    });
}


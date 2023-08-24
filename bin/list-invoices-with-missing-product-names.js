#!/usr/bin/env node

var Q = require('q');

var cli = require('../CARLI/CommandLine');
var config = require('../config');
var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var notificationRepository = require('../CARLI/Entity/NotificationRepository');

cli.asCouchAdmin(function() {
    return listNotificationsMissingProductName();
});

function listNotificationsMissingProductName() {
    console.log(`Finding notifications missing product name...`);

    return notificationRepository.list()
        .then(filterNotifications)
        .then(logNotifications);

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

}
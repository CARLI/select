var NotificationTemplateRepository = require('../CARLI').NotificationTemplate;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
NotificationTemplateRepository.setStore(Store(CouchDbStore(StoreOptions)));

var notificationTemplates = [
    {
        id: 'notification-template-library-invoices',
        name: 'Library Invoices',
        subject: 'CARLI Database Invoices',
        emailBody: '',
        pdfBody: '{{ pdfContent }}',
        pdfContentIsEditable: true
    },
    {
        id: 'notification-template-library-estimates-open',
        name: 'Library Estimates - Open Cycle',
        subject: 'Estimate: LIBRARY Selections',
        emailBody: '',
        pdfBody: '{{ pdfContent }}',
        pdfContentIsEditable: true
    },
    {
        id: 'notification-template-library-reminder',
        name: 'Library Reminder',
        subject: 'Reminder: CARLI Selection System Open',
        emailBody: '',
        pdfContentIsEditable: false
    },
    {
        id: 'notification-template-library-estimates-closed',
        name: 'Library Estimates - Closed Cycle',
        subject: 'Estimate: LIBRARY Selections',
        emailBody: '',
        pdfBody: '{{ pdfContent }}',
        pdfContentIsEditable: true
    },
    {
        id: 'notification-template-vendor-reports',
        name: 'Vendor Reports',
        subject: 'Report: CARLI Library Selections',
        emailBody: '',
        pdfBody: '{{ pdfContent }}',
        pdfContentIsEditable: false
    },
    {
        id: 'notification-template-contact-non-players',
        name: 'Contact Non-Players',
        subject: 'CARLI Selections',
        emailBody: '',
        pdfContentIsEditable: false
    },
    {
        id: 'notification-template-annual-access-fee-invoices',
        name: 'Annual Access Fee Invoices',
        subject: 'CARLI Annual Access Fee Invoices',
        emailBody: '',
        pdfBody: '{{ pdfContent }}',
        pdfContentIsEditable: false
    }
];

function migrateNotificationTemplates(){
    return Q.all( notificationTemplates.map(createNotificationTemplate));
}

function createNotificationTemplate( notificationTemplate ) {
    return NotificationTemplateRepository.create(notificationTemplate);
}

module.exports = {
    migrateNotificationTemplates: migrateNotificationTemplates
};

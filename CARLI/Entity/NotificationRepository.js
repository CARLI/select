var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , couchUtils = require( '../Store/CouchDb/Utils')()
    , libraryRepository = require('../Entity/LibraryRepository')
    , vendorRepository = require('../Entity/VendorRepository')
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , Q = require('q')
    ;

var NotificationRepository = Entity('Notification');
NotificationRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = ['cycle'];

function transformFunction( notification ){
    transformTargetEntityToId( notification );
    EntityTransform.transformObjectForPersistence(notification, propertiesToTransform);

    function transformTargetEntityToId( notification ){
        if ( notification.targetEntity && typeof notification.targetEntity === 'object' ){
            notification.targetEntity = notification.targetEntity.id.toString();
        }
    }
}

function expandNotifications( listPromise  ){
    return EntityTransform.expandListOfObjectsFromPersistence( listPromise, propertiesToTransform, functionsToAdd).then(function(notificationList) {
        return Q.all(notificationList.map(expandNotificationFromPersistence));
    });
}

function expandNotificationFromPersistence(notification) {
    return expandTargetEntities(notification);
}

function expandTargetEntities( notification ) {
    if (notificationTypeIsForLibrary(notification.notificationType)) {
        return libraryRepository.load(notification.targetEntity).then(function(library) {
            notification.targetEntity = library;
            return notification;
        });
    } else if (notificationTypeIsForVendor(notification.notificationType)) {
        return vendorRepository.load(notification.targetEntity).then(function(vendor) {
            notification.targetEntity = vendor;
            return notification;
        });
    } else {
        return notification;
    }
}

function createNotification( notification  ){
    return NotificationRepository.create( notification, transformFunction );
}

function updateNotification( notification ){
    return NotificationRepository.update( notification, transformFunction );
}

function listNotifications(){
    return expandNotifications( NotificationRepository.list() );
}

function loadNotification( notificationId  ){
    return NotificationRepository.load(notificationId)
        .then(function(notification) {
            return EntityTransform.expandObjectFromPersistence( notification, propertiesToTransform, functionsToAdd)
                .then(function() {
                    return expandNotificationFromPersistence(notification);
                });
        });
}

function sendNotification( notification ){
    notification.draftStatus = 'sent';
    notification.dateSent = new Date();
    notification.subject = notification.targetEntity.name + ': ' + notification.subject;

    return updateNotification(notification);
}

function listDrafts(){
    return listNotifications().then(keepUnsentNotifications);

    function keepUnsentNotifications(notifications){
        return notifications.filter(function(notification){
            return notification.draftStatus === 'draft';
        });
    }
}

function listSent(){
    return listNotifications().then(keepSentNotifications);

    function keepSentNotifications(notifications){
        return notifications.filter(function(notification){
            return notification.draftStatus === 'sent';
        });
    }
}

function listSentBetweenDates(startDate, endDate){
    return couchUtils.getCouchViewResultValuesWithinRange(config.getDbName(), 'listSentNotificationsByDate', startDate, endDate);
}

function getRecipientLabel(recipientName, notificationType) {
    return recipientName + ' ' + getLabelForNotificationType(notificationType);

    function getLabelForNotificationType(type) {
        var labels = {
            'estimate': 'Subscription Contacts',
            'invoice': 'Invoice Contacts',
            'report': 'Report Contacts',
            'subscription': 'Subscription Contacts'
        };
        return labels[type];
    }
}

function getSummaryTotal(notification, offerings) {
    if ( !offerings ){
        return;
    }

    if ( !offerings.length ){
        return 0;
    }

    return (notification.isFeeInvoice) ? getSummaryOfAccessFees() : getSummaryOfSelectedOfferings();

    function getSummaryOfAccessFees() {
        return offerings ? offerings.reduce(sumOfFees, 0) : 0;

        function sumOfFees(sum, offering) {
            if (offering.selection && offering.product.oneTimePurchaseAnnualAccessFee) {
                return sum + offering.product.oneTimePurchaseAnnualAccessFee;
            } else {
                return sum;
            }
        }
    }

    function getSummaryOfSelectedOfferings() {
        return offerings ? offerings.reduce(sumOfPrices, 0) : 0;

        function sumOfPrices(sum, offering) {
            if (offering.selection) {
                return sum + offering.selection.price;
            } else {
                return sum;
            }
        }
    }
}
function getRecipientLabelForInstance() {
    var notification = this;
    var recipientLabel = '';

    if ( notification.targetEntity ){
        recipientLabel = getRecipientLabel(notification.targetEntity.name, notification.notificationType);
    }
    else if ( notification.to ){
        recipientLabel = notification.to;
    }

    return recipientLabel;
}

var functionsToAdd = {
    getRecipientLabel: getRecipientLabelForInstance
};

function getId(offering){
    return offering.id;
}

function notificationTypeIsForLibrary(notificationType) {
    var results = {
        'estimate': true,
        'invoice': true,
        'report': false,
        'subscription': true
    };
    return results[notificationType];
}
function notificationTypeIsForVendor(notificationType) {
    var results = {
        'estimate': false,
        'invoice': false,
        'report': true,
        'subscription': false
    };
    return results[notificationType];
}

function setStore(store) {
    NotificationRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    setStore: setStore,
    create: createNotification,
    update: updateNotification,
    list: listNotifications,
    load: loadNotification,
    delete: NotificationRepository.delete,
    sendNotification: sendNotification,
    listDrafts: listDrafts,
    listSent: listSent,
    listSentBetweenDates: listSentBetweenDates,
    getRecipientLabel: getRecipientLabel,
    notificationTypeIsForLibrary: notificationTypeIsForLibrary,
    notificationTypeIsForVendor: notificationTypeIsForVendor,
    getSummaryTotal: getSummaryTotal
};

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
    if ( notification.draftStatus === 'sent' ){
        return Q.reject('Notification has already been sent');
    }

    notification.draftStatus = 'sent';
    notification.dateSent = new Date().toISOString();

    if ( notification.targetEntity && notification.targetEntity.name ){
        notification.targetEntityName = notification.targetEntity.name;
    }

    return setToField()
        .then(updateNotification);

    function setToField(){
        if ( notification.targetEntity ){
            var entityId = notification.targetEntity;
            if ( typeof notification.targetEntity === 'object' ){
                entityId = notification.targetEntity.id;
            }

            return getRecipientEmailAddresses(entityId, notification.notificationType)
                .then(function(emailAddresses){
                    notification.to = emailAddresses.join(',');
                    return notification;
                });
        }
        else {
            return Q(notification);
        }
    }
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

function getCategoryNameForNotificationType(type) {
    var labels = {
        'estimate': libraryRepository.CONTACT_CATEGORY_ESTIMATE,
        'invoice': libraryRepository.CONTACT_CATEGORY_INVOICE,
        'report': vendorRepository.CONTACT_CATEGORY_REPORT,
        'reminder': libraryRepository.CONTACT_CATEGORY_REMINDER
    };
    return labels[type];
}

function getRecipientLabel(recipientName, notificationType) {
    return recipientName + ' ' + getCategoryNameForNotificationType(notificationType);
}

function getRecipientEmailAddresses(recipientId, notificationType) {
    if ( !recipientId ){
        return [];
    }

    var notificationCategory = getCategoryNameForNotificationType(notificationType);

    if (notificationTypeIsForLibrary(notificationType)) {
        return libraryRepository.load(recipientId)
            .then(function(library){
                return libraryRepository.getContactEmailAddressesForNotification(library, notificationCategory);
            });
    }
    else if (notificationTypeIsForVendor(notificationType)) {
        return vendorRepository.load(recipientId)
            .then(function(vendor) {
                return vendorRepository.getContactEmailAddressesForNotification(vendor, notificationCategory);
            });
    }
    else {
        console.log('getRecipientEmailAddresses for unknown type: '+notificationType);
        return Q('');
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

function getRecipientEmailAddressesForInstance(){
    var notification = this;
    if ( notification.targetEntity ) {
        return getRecipientEmailAddresses(notification.targetEntity.id, notification.notificationType);
    }
    else {
        return Q([]);
    }
}

var functionsToAdd = {
    getRecipientLabel: getRecipientLabelForInstance,
    getRecipientEmailAddresses: getRecipientEmailAddressesForInstance
};

function notificationTypeIsForLibrary(notificationType) {
    var results = {
        'estimate': true,
        'invoice': true,
        'report': false,
        'reminder': true
    };
    return results[notificationType];
}

function notificationTypeIsForVendor(notificationType) {
    var results = {
        'estimate': false,
        'invoice': false,
        'report': true,
        'reminder': false
    };
    return results[notificationType];
}

function notificationTypeIsForInvoice(notificationType){
    return notificationType === 'invoice';
}

function notificationTypeIsForEstimate(notificationType){
    return notificationType === 'estimate';
}

function notificationTypeIsForReminder(notificationType){
    return notificationType === 'reminder';
}

function templateIsForAnnualAccessFeeInvoice(templateId) {
    return templateId === 'notification-template-annual-access-fee-invoices';
}

function notificationTypeAllowsRecipientsToBeEdited(notificationType){
    return notificationType === 'other';
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
    getRecipientEmailAddresses: getRecipientEmailAddresses,
    notificationTypeIsForLibrary: notificationTypeIsForLibrary,
    notificationTypeIsForVendor: notificationTypeIsForVendor,
    notificationTypeIsForInvoice: notificationTypeIsForInvoice,
    notificationTypeIsForEstimate: notificationTypeIsForEstimate,
    notificationTypeIsForReminder: notificationTypeIsForReminder,
    templateIsForAnnualAccessFeeInvoice: templateIsForAnnualAccessFeeInvoice,
    notificationTypeAllowsRecipientsToBeEdited: notificationTypeAllowsRecipientsToBeEdited,
    getSummaryTotal: getSummaryTotal
};

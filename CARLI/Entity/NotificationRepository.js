var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , offeringRepository = require('../Entity/OfferingRepository')
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , Q = require('q')
    ;

var NotificationRepository = Entity('Notification');
NotificationRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = ['cycle'];

function transformFunction( notification ){
    transformOfferingObjectsToIds( notification );
    EntityTransform.transformObjectForPersistence(notification, propertiesToTransform);
}

function transformOfferingObjectsToIds( notification ){
    if (notification.offerings) {
        notification.offerings = notification.offerings.map(getId);
    }
}

function expandNotifications( listPromise  ){

    return EntityTransform.expandListOfObjectsFromPersistence( listPromise, propertiesToTransform, functionsToAdd);
}

function expandOfferingObjects( notification ) {
    if (notification.offerings && notification.cycle) {
        return offeringRepository.getOfferingsById(notification.offerings, notification.cycle).then(attachOfferings);
    } else {
        return notification;
    }

    function attachOfferings(listOfOfferings) {
        notification.offerings = listOfOfferings;
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
                    return expandOfferingObjects(notification);
                });
        });
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

function getRecipientLabel(recipientName, notificationType) {
    return recipientName + ' ' + getLabelForNotificationType(notificationType);

    function getLabelForNotificationType(type) {
        var labels = {
            'invoice': 'Invoice Contacts',
            'report': 'Report Contacts',
            'subscription': 'Subscription Contacts'
        };
        return labels[type];
    }
}

function getSummaryTotal() {
    var notification = this;
    return notification.offerings.reduce(sumOfPrices, 0);

    function sumOfPrices(sum, offering) {
        return sum + offering.selection.price;
    }
}
var functionsToAdd = {
    'getSummaryTotal': getSummaryTotal
};

function getId(offering){
    return offering.id;
}

module.exports = {
    setStore: NotificationRepository.setStore,
    create: createNotification,
    update: updateNotification,
    list: listNotifications,
    load: loadNotification,
    delete: NotificationRepository.delete,
    listDrafts: listDrafts,
    listSent: listSent,
    getRecipientLabel: getRecipientLabel
};

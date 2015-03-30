var Entity = require('../Entity')
    , config = require( '../../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , Q = require('q')
    ;

var NotificationRepository = Entity('Notification');
NotificationRepository.setStore( Store( StoreModule(StoreOptions) ) );


NotificationRepository.listDrafts = function listDrafts(){
    return NotificationRepository.list().then(keepUnsentNotifications);

    function keepUnsentNotifications(notifications){
        return notifications.filter(function(notification){
            return notification.draftStatus === 'draft';
        });
    }
};

NotificationRepository.listSent = function listSent(){
    return NotificationRepository.list().then(keepSentNotifications);

    function keepSentNotifications(notifications){
        return notifications.filter(function(notification){
            return notification.draftStatus === 'sent';
        });
    }
};

NotificationRepository.getRecipientLabel = function getRecipientLabel(recipientName, notificationType) {
    return recipientName + ' ' + getLabelForNotificationType(notificationType);

    function getLabelForNotificationType(type) {
        var labels = {
            'invoice': 'Invoice Contacts',
            'report': 'Report Contacts',
            'subscription': 'Subscription Contacts'
        };
        return labels[type];
    }
};

NotificationRepository.notificationTypeIsForLibrary = function notificationTypeIsForLibrary(notificationType) {
    var results = {
        'invoice': true,
        'report': false,
        'subscription': true
    };
    return results[notificationType];
};

NotificationRepository.notificationTypeIsForVendor = function notificationTypeIsForVendor(notificationType) {
    var results = {
        'invoice': false,
        'report': true,
        'subscription': false
    };
    return results[notificationType];
};

module.exports = NotificationRepository;

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

module.exports = NotificationRepository;

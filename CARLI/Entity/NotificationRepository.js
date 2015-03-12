var Entity = require('../Entity')
    , config = require( '../../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    ;

var NotificationRepository = Entity('Notification');
NotificationRepository.setStore( Store( StoreModule(StoreOptions) ) );

module.exports = NotificationRepository;

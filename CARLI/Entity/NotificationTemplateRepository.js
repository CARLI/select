var Entity = require('../Entity')
    , config = require( '../../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    ;

var NotificationTemplateRepository = Entity('NotificationTemplate');
NotificationTemplateRepository.setStore( Store( StoreModule(StoreOptions) ) );

module.exports = NotificationTemplateRepository;

var Entity = require('../Entity')
    , config = require( '../../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    ;

var NotificationTemplateRepository = Entity('NotificationTemplate');
NotificationTemplateRepository.setStore( Store( StoreModule(StoreOptions) ) );

NotificationTemplateRepository.loadTemplateForOpenCycleEstimates = function(){
    return NotificationTemplateRepository.load('notification-template-library-estimates-open');
};

NotificationTemplateRepository.loadTemplateForClosedCycleEstimates = function() {
    return NotificationTemplateRepository.load('notification-template-library-estimates-closed');
};

NotificationTemplateRepository.loadTemplateForSubscriptionInvoices = function() {
    return NotificationTemplateRepository.load('notification-template-library-invoices');
};

NotificationTemplateRepository.loadTemplateForAnnualAccessFeeInvoices = function() {
    return NotificationTemplateRepository.load('notification-template-annual-access-fee-invoices');
};

NotificationTemplateRepository.loadTemplateForMembershipDuesInvoices = function() {
    return NotificationTemplateRepository.load('notification-template-membership-invoices');
};

NotificationTemplateRepository.loadTemplateForMembershipDuesEstimates = function() {
    return NotificationTemplateRepository.load('notification-template-membership-estimates');
};

NotificationTemplateRepository.isCustomTemplate = function( notificationTemplate ){
    return notificationTemplate.notificationType === 'other' &&
           notificationTemplate.id !== 'notification-template-open-system';
};

module.exports = NotificationTemplateRepository;

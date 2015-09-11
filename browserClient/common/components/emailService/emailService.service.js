angular.module('common.emailService')
    .service('emailService', emailService);

function emailService($q, CarliModules){
    var emailMiddleware = CarliModules.EmailMiddleware;

    return {
        sendOneTimePurchaseMessage: sendOneTimePurchaseMessage,
        sendVendorDoneEnteringPricingMessage: sendVendorDoneEnteringPricingMessage,
        sendAskCarliMessage: sendAskCarliMessage
    };

    function sendOneTimePurchaseMessage(offeringId){
        return $q.when(emailMiddleware.sendOneTimePurchaseMessage(offeringId));
    }

    function sendVendorDoneEnteringPricingMessage(vendorId){
        return $q.when(emailMiddleware.sendVendorDoneEnteringPricingMessage(vendorId));
    }

    function sendAskCarliMessage(messageObject){
        return $q.when(emailMiddleware.sendAskCarliMessage(messageObject));
    }
}
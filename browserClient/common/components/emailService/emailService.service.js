angular.module('common.emailService')
    .service('emailService', emailService);

function emailService($q, CarliModules){
    var emailMiddleware = CarliModules.EmailMiddleware;

    return {
        sendOneTimePurchaseMessage: sendOneTimePurchaseMessage,
        sendIpAddressChangeNotification: sendIpAddressChangeNotification,
        sendVendorDoneEnteringPricingMessage: sendVendorDoneEnteringPricingMessage,
        sendAskCarliMessage: sendAskCarliMessage
    };

    function sendOneTimePurchaseMessage(offeringId){
        return $q.when(emailMiddleware.sendOneTimePurchaseMessage(offeringId));
    }

    function sendIpAddressChangeNotification(libraryId) {
        return $q.when(emailMiddleware.sendIpAddressChangeNotification(libraryId));
    }

    function sendVendorDoneEnteringPricingMessage(vendorId){
        return $q.when(emailMiddleware.sendVendorDoneEnteringPricingMessage(vendorId));
    }

    function sendAskCarliMessage(messageObject){
        return $q.when(emailMiddleware.sendAskCarliMessage(messageObject));
    }
}

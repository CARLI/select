angular.module('common.emailService')
    .service('emailService', emailService);

function emailService($q, CarliModules){
    var emailMiddleware = CarliModules.EmailMiddleware;

    return {
        sendOneTimePurchaseMessage: sendOneTimePurchaseMessage
    };

    function sendOneTimePurchaseMessage(offeringId){
        return $q.when(emailMiddleware.sendOneTimePurchaseMessage(offeringId));
    }
}
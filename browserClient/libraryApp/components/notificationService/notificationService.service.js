angular.module('library.notificationService')
    .service('notificationService', notificationService);

function notificationService($q, CarliModules){
    var emailMiddleware = CarliModules.EmailMiddleware;

    return {
        sendOneTimePurchaseMessage: sendOneTimePurchaseMessage
    };

    function sendOneTimePurchaseMessage(offeringId){
        return $q.when(emailMiddleware.sendOneTimePurchaseMessage(offeringId));
    }
}
angular.module('library.notificationService')
    .service('notificationService', notificationService);

function notificationService($q, CarliModules){
    var emailMiddleware = CarliModules.EmailMiddleware;

    return {
        sendOneTimePurchaseMessage: sendOneTimePurchaseMessage
    };

    function sendOneTimePurchaseMessage(productId, libraryId){
        return $q.when(emailMiddleware.sendOneTimePurchaseMessage(productId, libraryId));
    }
}
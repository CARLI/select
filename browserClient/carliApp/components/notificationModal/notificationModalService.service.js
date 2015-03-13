angular.module('carli.notificationModal')
    .factory('notificationModalService', notificationModalService);

function notificationModalService() {
    var message = null;

    return {
        sendStartDraftMessage: sendMessage,
        receiveStartDraftMessage: receiveMessage,
        acknowledgeStartDraftMessage: acknowledgeMessage
    };

    function sendMessage(newMessage) {
        message = newMessage;
    }
    function receiveMessage() {
        return message;
    }
    function acknowledgeMessage() {
        message = null;
    }

}

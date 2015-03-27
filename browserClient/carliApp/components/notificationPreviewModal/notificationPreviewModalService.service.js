angular.module('carli.notificationPreviewModal')
    .factory('notificationPreviewModalService', notificationPreviewModalService);

function notificationPreviewModalService() {
    var message = null;

    return {
        sendShowPreviewMessage: sendMessage,
        receiveShowPreviewMessage: receiveMessage,
        acknowledgeShowPreviewMessage: acknowledgeMessage
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

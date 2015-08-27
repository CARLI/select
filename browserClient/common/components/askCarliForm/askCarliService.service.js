angular.module('common.askCarliForm')
    .factory('askCarliService', askCarliService);

function askCarliService( emailService ) {
    var message = null;

    return {
        sendStartDraftMessage: sendMessage,
        receiveStartDraftMessage: receiveMessage,
        acknowledgeStartDraftMessage: acknowledgeMessage,
        sendAskCarliMessage: sendAskCarliMessage
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

    function sendAskCarliMessage( messageObject ){
        return emailService.sendAskCarliMessage(messageObject);
    }
}

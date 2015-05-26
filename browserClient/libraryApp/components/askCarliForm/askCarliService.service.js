angular.module('library.askCarliForm')
    .factory('askCarliService', askCarliService);

function askCarliService( $http, config ) {
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
        var url = config.getMiddlewareUrl() + '/tell-pixobot';
        return $http.put(url, {message: "Ask CARLI: " + messageObject.message.messageBody+' ('+messageObject.message.context+')'});
    }
}

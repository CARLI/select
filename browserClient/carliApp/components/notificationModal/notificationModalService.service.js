angular.module('carli.notificationModal')
    .factory('notificationModalService', notificationModalService);

function notificationModalService() {
    var draftMessage = null;

    return {
        sendStartDraftMessage: sendStartDraftMessage,
        receiveStartDraftMessage: receiveStartDraftMessage,
        acknowledgeStartDraftMessage: acknowledgeStartDraftMessage
    };

    function sendStartDraftMessage(draftConfigurationAndTemplateData) {
        draftMessage = draftConfigurationAndTemplateData;
    }
    function receiveStartDraftMessage() {
        return draftMessage;
    }
    function acknowledgeStartDraftMessage() {
        draftMessage = null;
    }
}

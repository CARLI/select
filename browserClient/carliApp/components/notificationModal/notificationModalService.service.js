angular.module('carli.notificationModal')
    .factory('notificationModalService', notificationModalService);

function notificationModalService() {
    var draftMessage = null;
    var editMessage = null;

    return {
        sendStartDraftMessage: sendStartDraftMessage,
        receiveStartDraftMessage: receiveStartDraftMessage,
        acknowledgeStartDraftMessage: acknowledgeStartDraftMessage,
        sendEditDraftMessage: sendEditDraftMessage,
        receiveEditDraftMessage: receiveEditDraftMessage,
        acknowledgeEditDraftMessage: acknowledgeEditDraftMessage
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

    function sendEditDraftMessage(notification) {
        editMessage = notification;
    }
    function receiveEditDraftMessage() {
        return editMessage;
    }
    function acknowledgeEditDraftMessage() {
        editMessage = null;
    }
}

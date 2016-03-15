angular.module('carli.editOffering')
    .service('editOfferingService', editOfferingService);

function editOfferingService( offeringService ) {

    var currentOffering = null;

    return {
        receiveOfferingEditableMessage: receiveOfferingEditableMessage,
        acknowledgeOfferingMadeEditable: acknowledgeOfferingMadeEditable,
        sendOfferingEditableMessage: sendOfferingEditableMessage
    };


    function receiveOfferingEditableMessage() {
        return currentOffering;
    }

    function acknowledgeOfferingMadeEditable() {
        currentOffering = null;
    }

    function sendOfferingEditableMessage(offering) {
        if ( typeof offering === 'string' ){
            offeringService.load(offering).then(function(o) {
                currentOffering = o;
            });
        } else {
            currentOffering = offering;
        }
    }
}

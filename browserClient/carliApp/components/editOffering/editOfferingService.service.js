angular.module('carli.editOffering')
    .service('editOfferingService', editOfferingService);

function editOfferingService( offeringService ) {

    var currentOffering = null;

    return {
        receiveOfferingEditableMessage: receiveOfferingEditableMessage,
        acknowledgeOfferingMadeEditable: acknowledgeOfferingMadeEditable,
        sendOfferingEditableMessage: sendOfferingEditableMessage,
        toggleOfferingUserFlaggedState: toggleOfferingUserFlaggedState
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

    function toggleOfferingUserFlaggedState(offeringId){
        return offeringService.load(offeringId)
            .then(toggleOfferingFlaggedState)
            .then(offeringService.update);

        function toggleOfferingFlaggedState( offering ){
            offering.flagged = !offeringService.getFlaggedState(offering);
            return offering;
        }
    }
}

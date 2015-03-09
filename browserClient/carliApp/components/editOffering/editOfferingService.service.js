angular.module('carli.editOffering')
    .service('editOfferingService', editOfferingService);

function editOfferingService( offeringService ) {

    var currentOffering = null;

    return {
        getCurrentOffering: getCurrentOffering,
        setCurrentOffering: setCurrentOffering,
        toggleOfferingUserFlaggedState: toggleOfferingUserFlaggedState
    };


    function getCurrentOffering() {
        return currentOffering;
    }

    function setCurrentOffering(offering) {
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

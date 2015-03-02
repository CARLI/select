angular.module('carli.editOffering')
    .service('editOfferingService', editOfferingService);

function editOfferingService( offeringService ) {

    var currentOffering = null;

    return {
        getCurrentOffering: getCurrentOffering,
        setCurrentOffering: setCurrentOffering
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
}

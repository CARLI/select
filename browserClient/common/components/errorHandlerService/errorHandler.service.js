angular.module('common.errorHandler')
.service('errorHandler', returnErrorHandlerFunction);

function returnErrorHandlerFunction(alertService){
    return handleError;

    function handleError( error ){
        console.log('handled error ', error);
        alertService.putAlert( error, { severity: 'danger' } );
    }
}
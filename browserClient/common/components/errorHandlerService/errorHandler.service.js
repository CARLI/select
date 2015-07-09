angular.module('common.errorHandler')
.service('errorHandler', returnErrorHandlerFunction);

function returnErrorHandlerFunction($rootScope, $location, alertService, authService){
    return handleError;

    function handleError( error ){
        if (error.statusCode === 401) {
            handleAuthFailure();
        } else {
            console.log('handled error ', error);
            alertService.putAlert( error, { severity: 'danger' } );
        }
    }

    function handleAuthFailure() {
        $rootScope.returnTo = $location.url();
        authService.deleteSession();
    }
}

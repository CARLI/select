angular.module('common.errorHandler')
.service('errorHandler', returnErrorHandlerFunction);

function returnErrorHandlerFunction($rootScope, $location, alertService, authService){
    return handleError;

    function handleError( error ){
        if (error.statusCode === 401) {
            handleAuthFailure();
        }
        else if ( error.statusCode === 502 ){
            handleBackendUnavailable();
        }
        else {
            console.log('handled error ', error);
            showErrorToUser(error);
        }
    }

    function handleAuthFailure() {
        $rootScope.returnTo = $location.url();
        authService.deleteSession();
    }

    function handleBackendUnavailable(error){
        showErrorToUser('The database is currently not reachable. This is an error that makes the system inoperable. Please notify CARLI.');
    }

    function showErrorToUser(message){
        alertService.putAlert(message, { severity: 'danger' });
    }
}

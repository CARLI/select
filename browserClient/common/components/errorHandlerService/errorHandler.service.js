angular.module('common.errorHandler')
.service('errorHandler', returnErrorHandlerFunction);

function returnErrorHandlerFunction($rootScope, $location, alertService, authService){
    return handleError;

    function handleError( error ){
        if (error.statusCode === 401) {
            handleAuthFailure();
        }
        else if ( error.statusCode === 409 ){
            handleConflict(error);
        }
        else if ( error.statusCode === 413 ){
            handleFileTooLarge(error);
        }
        else if ( error.statusCode === 500 ){
            if ( errorLooksLikeMySql(error) ){
                console.log('handled probable MySQL error', error);
                handleBackendUnavailable();
            }
            else {
                showErrorToUser(error);
            }
        }
        else if ( error.statusCode === 502 ){
            handleBackendUnavailable();
        }
        else if ( error.statusCode === 504 ){
            handleBackendTimeout();
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

    function handleConflict(error){
        showErrorToUser('Your changes could not be saved because of a conflict. Please reload the page and try again.');
        //TODO: log conflict details for debugging
        console.log('conflict: ',error);
    }

    function handleFileTooLarge(error){
        showErrorToUser('The file you tried to upload is too large.');
    }

    function handleBackendUnavailable(error){
        showErrorToUser('The database is currently not reachable. This is an error that makes the system inoperable. Please notify CARLI.');
    }

    function handleBackendTimeout(error){
        showErrorToUser('The database is currently under heavy load. Please try your request again at another time.');
    }

    function showErrorToUser(message){
        alertService.putAlert(message, { severity: 'danger' });
    }

    function errorLooksLikeMySql(error){
        return error.message === "unknown error" &&
               typeof error.originalError === 'object' &&
               error.originalError.code &&
               error.originalError.syscall;
    }
}

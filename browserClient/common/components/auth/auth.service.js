angular.module('common.auth')
    .service('authService', authService);

function authService() {
    return {
        logIn: logIn
    };

    function logIn(user) {
        //return $request(config.couchDbUrl + '_session')
        //    .then(function(session) {
        //        console.log(session);
        //        $rootScope.loggedIn = true;
        //        return session;
        //    });
    }
}

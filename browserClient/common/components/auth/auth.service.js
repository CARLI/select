angular.module('common.auth')
    .service('authService', authService);

function authService($q, CarliModules) {
    return {
        logIn: function (user) { return $q.when ( CarliModules.AuthMiddleware.logIn(user) ); }
    };
}

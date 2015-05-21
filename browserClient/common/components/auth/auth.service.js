angular.module('common.auth')
    .service('authService', authService);

function authService(CarliModules) {
    return {
        logIn: CarliModules.AuthMiddleware.logIn
    };
}

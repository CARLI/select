angular.module('common.userService')
    .service('userService', userService);

function userService(CarliModules, $q, authService) {

    var userMiddleware = CarliModules.UserMiddleware;

    return {
        list: function () {
            return $q.when( userMiddleware.list() );
        },
        create: function (user) {
            return $q.when( userMiddleware.create(user) );
        },
        update: function (user) {
            return $q.when( userMiddleware.update(user) );
        },
        load: function (userId) {
            return $q.when( userMiddleware.load(userId) );
        },
        delete: function(user) {
            return $q.when( userMiddleware.delete(user) );
        },
        requestPasswordReset: function (email) {
            return $q.when( userMiddleware.requestPasswordReset(email) );
        },
        isKeyValid: function (key, user) {
            return $q.when( userMiddleware.isKeyValid(key, user) );
        },
        consumeKey: function (key, user) {
            return $q.when( userMiddleware.consumeKey(key, user) );
        },
        getUser: function () {
            return authService.getCurrentUser();
        },
        userIsReadOnly: function () {
            return authService.userIsReadOnly();
        }
    };
}

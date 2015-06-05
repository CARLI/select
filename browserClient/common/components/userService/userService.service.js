angular.module('common.userService')
    .service('userService', userService);

function userService(CarliModules, $q, cycleService) {

    var userMiddleware = CarliModules.UserMiddleware;

    return {
        list: function () {
            return $q.when( userMiddleware.list(cycleService.getCurrentCycle()) );
        },
        create: function (user) {
            return $q.when( userMiddleware.create(user, user.cycle) );
        },
        update: function (user) {
            return $q.when( userMiddleware.update(user, user.cycle) );
        },
        load: function (userId) {
            return $q.when( userMiddleware.load(userId, cycleService.getCurrentCycle()) );
        },
        requestPasswordReset: function (email) {
            return $q.when( userMiddleware.requestPasswordReset(email) );
        }
    };
}

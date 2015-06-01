angular.module('common.userService')
    .service('userService', userService);

function userService( CarliModules, $q, cycleService ) {

    var userModule = CarliModules.User;
    var userMiddleware = CarliModules.UserMiddleware;

    return {
        list:   function() {
            return $q.when( userMiddleware.list( cycleService.getCurrentCycle() ) );
        },
        create: function( user ) {
            return $q.when( userModule.create(user, user.cycle) );
        },
        update: function( user ) {
            return $q.when( userModule.update(user, user.cycle) );
        },
        load:   function( userId ) {
            return $q.when( userMiddleware.load( userId, cycleService.getCurrentCycle()) );
        }
    };

}

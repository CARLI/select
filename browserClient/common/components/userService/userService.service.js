angular.module('common.userService')
    .service('userService', userService);

function userService( CarliModules, $q, cycleService, libraryService, offeringService ) {

    var userModule = CarliModules.User;

    return {
        list:   function() {
            return $q.when( userModule.list( cycleService.getCurrentCycle() ) );
        },
        create: function( user ) {
            return $q.when( userModule.create(user, user.cycle) );
        },
        update: function( user ) {
            return $q.when( userModule.update(user, user.cycle) );
        },
        load:   function( userId ) {
            return $q.when( userModule.load( userId, cycleService.getCurrentCycle()) );
        }
    };

}

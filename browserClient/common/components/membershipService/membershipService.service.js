angular.module('common.membershipService')
    .service('membershipService', membershipService);

function membershipService( CarliModules, $q, errorHandler ) {

    var membershipModule = CarliModules.Membership;

    return {
        list:   function() { return $q.when( membershipModule.list() ).catch(errorHandler); },
        create: function() { return $q.when( membershipModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( membershipModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( membershipModule.load.apply(this, arguments) ); },
        loadDataForYear: function( year ){
            return $q.when( membershipModule.loadDataForYear(year) );
        },
        getMembershipFeesForLibrary: function(libraryId, year) {
            return membershipModule.getMembershipFeesForLibrary(libraryId, year);
        }
    };
}

angular.module('vendor.userLookup')
    .service('userLookup', userLookupService);

function userLookupService( $q, CarliModules, userService ){
    return {
        initializeUserFromToken: initializeUserFromToken,
        getFullUser: getFullUser
    };


    function initializeUserFromToken( token ){
        return getFullUser(token)
            .then(function(user){
                userService.setUser(user);
            });
    }

    function getFullUser( token ){

        return getMockUserFakeMiddlewareCall(token.userName)
            .then(function(user) {
                return $q.when(CarliModules.Vendor.load(token.vendorId)).then(function(vendor) {
                    user.vendor = vendor;
                    return user;
                });
            });

        function getMockUserFakeMiddlewareCall(userName) {
            return $q.when({
                userName: userName
            });
        }
    }
}

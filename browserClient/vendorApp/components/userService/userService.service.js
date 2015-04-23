angular.module('vendor.userService')
.service('userService', userService);

function userService(CarliModules, $q, $window, appState) {
    var currentUser = {};

    function initializeUserFromToken( token ){
        return getFullUser(token)
            .then(function(user){
                setUser(user);
            });
    }
    function getUser() {
        return currentUser;
    }
    function setUser(user) {
        appState.setUser(user);
        currentUser = user;
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
    function logout() {
        appState.setUser(null);
        $window.sessionStorage.removeItem('authToken'); // TODO: not the right place to do this
        $window.location.reload();
    }

    return {
        initializeUserFromToken: initializeUserFromToken,
        getUser: getUser,
        logout: logout
    };
}

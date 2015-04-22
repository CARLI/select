angular.module('vendor.userService')
.service('userService', userService);

function userService($window, appState) {
    var currentUser = {};

    function setUser(user) {
        appState.setUser(user);
        currentUser = user;
    }
    function getUser() {
        return currentUser;
    }
    function logout() {
        appState.setUser(null);
        $window.sessionStorage.removeItem('authToken'); // TODO: not the right place to do this
        $window.location.reload();
    }

    return {
        getUser: getUser,
        setUser: setUser,
        logout: logout
    };
}

angular.module('vendor.userService')
.service('userService', userService);

function userService(appState) {
    var currentUser = {};

    function setUser(user) {
        appState.setUser(user);
        currentUser = user;
    }
    function getUser() {
        return currentUser;
    }

    return {
        getUser: getUser,
        setUser: setUser
    };
}

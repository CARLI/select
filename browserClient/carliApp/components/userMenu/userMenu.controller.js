angular.module('carli.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController( $interval, authService, notificationService, authTimeoutService ){
    var vm = this;

    vm.userName = '';
    vm.logout = authService.deleteSession;
    vm.forceTimeoutWarning = authTimeoutService.forceTimoutWarning;

    activate();

    function activate() {
        loadUserInfo();
    }

    function loadUserInfo() {
        authService.fetchCurrentUser().then(function (user) {
            vm.userName = user.fullName;
        });
    }
}

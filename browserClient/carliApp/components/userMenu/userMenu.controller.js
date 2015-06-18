angular.module('carli.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController( $interval, authService, notificationService ){
    var vm = this;

    vm.userName = '';

    vm.logout = authService.deleteSession;

    activate();

    function activate() {
        loadUserInfo();
    }

    function loadUserInfo() {
        authService.getCurrentUser().then(function (user) {
            vm.userName = user.fullName;
        });
    }
}

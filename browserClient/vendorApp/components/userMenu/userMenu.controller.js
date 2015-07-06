angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController(authService){
    var vm = this;

    vm.userName = '';
    vm.logout = authService.deleteSession;

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

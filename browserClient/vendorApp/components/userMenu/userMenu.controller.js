angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController(authService){
    var vm = this;
    vm.fullName = null;
    vm.logout = authService.deleteSession;

    activate();

    function activate() {
        loadUserInfo();
    }

    function loadUserInfo() {
        authService.fetchCurrentUser().then(function (user) {
            vm.fullName = user.fullName;
        });
    }
}

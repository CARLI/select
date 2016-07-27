angular.module('library.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController(authService){
    var vm = this;

    vm.userName = '';
    vm.logout = authService.deleteSession;
    vm.isStaffUser = false;

    activate();

    function activate() {
        loadUserInfo();
    }

    function loadUserInfo() {
        authService.fetchCurrentUser().then(function (user) {
            vm.userName = user.fullName;
            vm.libraryName = user.library.name;

            if (user.roles.indexOf('staff') >= 0) {
                vm.isStaffUser = true;
            }
        });
    }
}

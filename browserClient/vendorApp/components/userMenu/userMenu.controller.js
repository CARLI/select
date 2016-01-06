angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController($window, authService){
    var vm = this;

    vm.userName = '';
    vm.logout = logout;
    vm.isStaffUser = false;

    activate();

    function activate() {
        loadUserInfo();
    }

    function loadUserInfo() {
        authService.fetchCurrentUser().then(function (user) {
            vm.userName = user.fullName;
            vm.vendorName = user.vendor.name;

            if (user.roles.indexOf('staff') >= 0) {
                vm.isStaffUser = true;
            }
        });
    }

    function logout() {
        authService.deleteSession().then(reload);

        function reload() {
            return $window.location.reload();
        }
    }
}

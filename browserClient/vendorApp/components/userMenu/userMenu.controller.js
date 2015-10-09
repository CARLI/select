angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController($window, authService){
    var vm = this;

    vm.userName = '';
    vm.logout = logout;

    activate();

    function activate() {
        loadUserInfo();
    }

    function loadUserInfo() {
        authService.fetchCurrentUser().then(function (user) {
            vm.userName = user.fullName;
        });
    }

    function logout() {
        authService.deleteSession().then(reload);

        function reload() {
            return $window.location.reload();
        }
    }
}

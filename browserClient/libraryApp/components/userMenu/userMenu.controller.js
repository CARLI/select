angular.module('library.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController($rootScope, userService){
    var vm = this;
    vm.userName = null;
    vm.logout = userService.logout;

    $rootScope.$watch(userService.getUser, function(user) {
        if (user.userName) {
            vm.userName = user.userName;
        }
    });
}

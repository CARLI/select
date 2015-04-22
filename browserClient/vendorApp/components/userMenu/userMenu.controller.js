angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController($rootScope, userService){
    var vm = this;
    vm.userName = null;

    $rootScope.$watch(userService.getUser, function(user) {
        if (user.userName) {
            vm.userName = user.userName;
        }
    });
}

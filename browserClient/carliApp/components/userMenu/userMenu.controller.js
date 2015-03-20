angular.module('carli.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController(){
    var vm = this;

    vm.notificationsCount = 2;
    vm.userName = 'Username!';
}
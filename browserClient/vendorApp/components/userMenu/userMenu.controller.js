angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController(){
    var vm = this;
    vm.userName = 'Username!';
}

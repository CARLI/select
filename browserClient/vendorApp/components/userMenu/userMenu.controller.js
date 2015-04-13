angular.module('vendor.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController($rootScope){
    var vm = this;
    vm.userName = 'Username!';

    $rootScope.$watch('currentUser.userName', function(userName) {
        if (userName) {
            vm.userName = userName;
        }
    });
}

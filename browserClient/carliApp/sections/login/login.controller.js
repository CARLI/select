angular.module('carli.sections.login')
    .controller('loginController', loginController);

function loginController (carliModules) {
    var vm = this;

    vm.userInfo = {
        username: '',
        password: ''
    };

    vm.logIn = authService.logIn;
}

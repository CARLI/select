angular.module('carli.sections.login')
    .controller('loginController', loginController);

function loginController ($rootScope, authService) {
    var vm = this;

    vm.user = {
        email: '',
        password: ''
    };

    vm.logIn = logIn;

    function logIn() {
        return authService.logIn(vm.user)
            .then(loginSuccess)
            .catch(loginFailure);

        function loginSuccess(user) {
            console.log(user);
            $rootScope.isLoggedIn = true;
        }

        function loginFailure() {

        }
    }
}

angular.module('carli.sections.login')
    .controller('loginController', loginController);

function loginController ($rootScope, $location, alertService, authService) {
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
            console.log("Auth success:", user);
            $rootScope.isLoggedIn = true;
            var returnTo = getReturnTo() || '/';
            $location.url(returnTo);
        }

        function loginFailure(err) {
            console.log("Auth failure:", err);
            alertService.putAlert("Invalid username or password", { severity: err });
        }

        function getReturnTo() {
            var queryString = $location.search();
            return queryString['return_to'];
        }
    }
}

angular.module('carli.sections.login')
    .controller('loginController', loginController);

function loginController ($location, alertService, authService) {
    var vm = this;

    vm.userLogin = {
        email: '',
        password: ''
    };

    redirectIfLoggedIn();

    vm.createSession = createSession;

    function createSession() {
        return authService.createSession(vm.userLogin)
            .then(loginSuccess)
            .catch(loginFailure);

        function loginSuccess() {

            authService.requireSession()
                .then(authService.requireStaff)
                .then(authService.getCurrentUser)
                .then(redirectAfterLogin);
        }

        function loginFailure(err) {
            alertService.putAlert("Email or password is incorrect", { severity: err });
        }
    }

    function redirectIfLoggedIn() {
        authService.getCurrentUser()
            .then(redirectAfterLogin)
            .catch(swallowAuthError);

        function swallowAuthError() {
            return true;
        }
    }

    function redirectAfterLogin() {
        var returnTo = getReturnTo() || '/';
        $location.url(returnTo);
    }

    function getReturnTo() {
        var queryString = $location.search();
        return queryString['return_to'];
    }
}

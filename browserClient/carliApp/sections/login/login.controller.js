angular.module('carli.sections.login')
    .controller('loginController', loginController);

function loginController ($location, alertService, authService, errorHandler, userService) {
    var vm = this;

    vm.userLogin = {};

    redirectIfLoggedIn();
    activate();

    function activate() {
        vm.forgotMode = false;
        vm.resetRequestSent = false;
        vm.submitLabel = "Log in";
        vm.userLogin = {
            email: '',
            password: ''
        };
    }

    vm.resetLoginForm = activate;
    vm.submitLoginForm = submitLoginForm;
    vm.toggleForgotMode = toggleForgotMode;

    function submitLoginForm() {
        if (vm.forgotMode) {
            return requestPasswordReset();
        } else {
            return createSession();
        }
    }

    function toggleForgotMode() {
        vm.forgotMode = !vm.forgotMode;
        vm.submitLabel = vm.forgotMode ? 'Request Password Reset' : 'Log in';
    }

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

    function requestPasswordReset() {
        return userService.requestPasswordReset(vm.userLogin.email)
            .then(function () {
                vm.resetRequestSent = true;
            })
            .catch(errorHandler);


        function loadUser() {
            return userService.load(vm.userLogin.email);
        }
    }
}

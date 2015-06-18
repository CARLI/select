angular.module('common.login')
    .controller('loginController', loginController);

function loginController ($rootScope, $location, alertService, authService, userService) {
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
            authService.authenticateForVendorApp().then(redirectIfLoggedIn);
        }

        function loginFailure(err) {
            alertService.putAlert("Email or password is incorrect", { severity: err });
        }
    }

    function redirectIfLoggedIn() {
        authService.getCurrentUser()
            .then(redirectAfterLogin)
            .catch(swallowAuthError);

        function swallowAuthError(err) {
            console.log('ignoring error', err);
            return true;
        }
    }

    function redirectAfterLogin() {
        console.log('redirecting');
        var returnTo = getReturnTo() || '/dashboard';
        $location.url(returnTo);
    }

    function getReturnTo() {
        return queryStringReturnTo() || rootScopeReturnTo();

        function queryStringReturnTo() {
            var queryString = $location.search();
            return queryString['return_to'];
        }

        function rootScopeReturnTo() {
            return $rootScope.returnTo;
        }
    }

    function requestPasswordReset() {
        return userService.requestPasswordReset(vm.userLogin.email)
            .then(function () {
                vm.resetRequestSent = true;
            })
            .catch(function (err) {
                if (err.statusCode == 404) {
                    alertService.putAlert(vm.userLogin.email + ' is not a registered user', { severity: 'danger' });
                } else {
                    throw err;
                }
            });
    }
}

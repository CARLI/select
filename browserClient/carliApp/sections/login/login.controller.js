angular.module('carli.sections.login')
    .controller('loginController', loginController);

function loginController ($location, alertService, authService, userService) {
    var vm = this;

    vm.userLogin = {
        email: '',
        password: ''
    };

    redirectIfLoggedIn();

    vm.forgotMode = false;
    vm.submitLabel = "Log in";

    vm.submitLoginForm = submitLoginForm;
    vm.toggleForgotMode = toggleForgotMode;

    function submitLoginForm() {
        if (vm.forgotMode) {
            requestPasswordReset();
        } else {
            createSession();
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
        // TODO: Need a userResetRequest service for the new entity
        //userService
        //    .requestPasswordReset(vm.userLogin.email)
        //    .then(loadUser)
        //    .then(function (user) {
        //        console.log('Generated password reset key for ' + user.email);
        //        console.log('/reset?k=' + user.passwordResetKey);
        //    })
        //    .catch(function (err) {
        //        console.log(err);
        //    });

        function loadUser() {
            return userService.load(vm.userLogin.email);
        }
    }
}

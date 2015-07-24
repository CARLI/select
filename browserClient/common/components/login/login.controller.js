angular.module('common.login')
    .controller('loginController', loginController);

function loginController ($q, $rootScope, $location, alertService, authService, userService) {
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

        function loginSuccess(userContext) {
            var userType = getUserType();
            var appType = getAppType();

            ensureUserIsLoggingIntoTheAppropriateApp()
                .then(authenticateForTheAppropriateApp)
                ; // .catch(redirectUserToTheCorrectApp);

            function ensureUserIsLoggingIntoTheAppropriateApp() {
                if (userType !== appType) {
                    throw new Error('User role mismatch');
                }
                return $q.when(true);
            }

            function authenticateForTheAppropriateApp() {
                var authMethodName = 'authenticateFor' + capitalizeFirstLetter(userType) + 'App';
                authService[authMethodName]().then(redirectIfLoggedIn);
            }
            function redirectUserToTheCorrectApp() {
                // TODO: need to have the 3 app URL's in the config to do this.
                // For now, this will just be treated like an invalid username/password.
            }

            function getUserType() {
                //noinspection IfStatementWithTooManyBranchesJS
                if (userContext.roles.indexOf('vendor') >= 0) {
                    return 'vendor';
                } else if (userContext.roles.indexOf('library') >= 0) {
                    return 'library';
                } else if (userContext.roles.indexOf('staff') >= 0) {
                    return 'staff';
                } else {
                    throw new Error('Invalid user');
                }
            }

            function getAppType() {
                // TODO: add the 3 app urls to the config, and check that instead of this hack.
                if (window.location.hostname.indexOf('vendor') >= 0) {
                    return 'vendor';
                } else if (window.location.hostname.indexOf('library') >= 0) {
                    return 'library';
                } else {
                    return 'staff';
                }
            }

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        }

        function loginFailure(err) {
            alertService.putAlert("Email or password is incorrect", { severity: 'danger' });
        }
    }

    function redirectIfLoggedIn() {
        authService.fetchCurrentUser()
            .then(redirectAfterLogin)
            .catch(swallowAuthError);

        function swallowAuthError(err) {
            return true;
        }
    }

    function redirectAfterLogin() {
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
            var returnTo = $rootScope.returnTo;
            $rootScope.returnTo = null;
            return returnTo;
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
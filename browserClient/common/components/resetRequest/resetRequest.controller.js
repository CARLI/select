angular.module('common.resetRequest')
    .controller('resetRequestController', resetRequestController);

function resetRequestController($routeParams, $q, alertService, authService, userService) {
    var vm = this;
    var resetKey = $routeParams.key;

    vm.user = {};

    vm.submitResetForm = submitResetForm;

    activate();

    function activate() {
        userService.isKeyValid(resetKey)
            .then(loadUser)
            .catch(authService.redirectToLogin);

        function loadUser(resetRequest) {
            userService.load(resetRequest.email).then(function (user) {
                vm.user = user;
            });
        }
    }

    function submitResetForm() {
        if (!confirmPasswordsMatch()) {
            alertService.putAlert('Passwords do not match', {severity: 'danger'});
            return $q.reject('Passwords do not match');
        }

        return userService.consumeKey(resetKey, vm.user)
            .then(authService.redirectToLogin);
    }

    function confirmPasswordsMatch() {
        if (vm.user.password || vm.passwordConfirmation) {
            return vm.user.password == vm.passwordConfirmation;
        }
        return true;
    }
}

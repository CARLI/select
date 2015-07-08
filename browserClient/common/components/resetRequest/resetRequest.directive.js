angular.module('common.resetRequest')
    .directive('resetRequest', function() {
        return {
            restrict: 'E',
            template: [
                '<div class="section" id="login">' +
                '    <section class="content">' +
                '        <h1>Reset Password for {{ vm.user.fullName }}</h1>' +
                '        <label for="password">Type in a new password</label>' +
                '        <input type="password" ng-model="vm.user.password" id="password">' +
                '        <label for="password-confirmation">Confirm password</label>' +
                '        <input type="password" ng-model="vm.passwordConfirmation" id="password-confirmation">' +
                '        <input type="submit" class="carli-button login-button" value="Set New Password" busy-click="vm.submitResetForm()">' +
                '    </section>' +
                '</div>'
            ].join(''),
            scope: true,
            controller: 'resetRequestController',
            controllerAs: 'vm'
        };
    });

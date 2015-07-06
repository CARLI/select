angular.module('common.resetRequest')
    .directive('resetRequest', function() {
        return {
            restrict: 'E',
            template: [
                '<div class="section" id="login">' +
                '    <section class="content">' +
                '        <h1>Reset Password for {{ vm.user.fullName }}</h1>' +
                '            <label for="password">Type in a new password</label>' +
                '            <view-edit-secret ng-model="vm.user.password" edit-mode="true" input-id="password">' +
                '        </view-edit-secret>' +
                '        <label for="password-confirmation">Confirm password</em></label>' +
                '            <view-edit-secret ng-model="vm.passwordConfirmation" edit-mode="true" input-id="password-confirmation">' +
                '        </view-edit-secret>' +
                '        <input type="submit" class="carli-button login-button" value="Set New Password" busy-click="vm.submitResetForm()">' +
                '    </section>' +
                '</div>'
            ].join(''),
            scope: true,
            transclude: true,
            controller: 'resetRequestController',
            controllerAs: 'vm'
        };
    });

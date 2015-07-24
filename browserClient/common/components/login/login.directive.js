angular.module('common.login')
    .directive('login', function() {
        return {
            restrict: 'E',
            template: [
                '<section class="content" id="login">' +
                '  <form ng-show="!vm.resetRequestSent">' +
                '    <div class="forgot-instructions" ng-show="vm.forgotMode">' +
                '      Please enter your email address, and then check your email for further instructions.' +
                '    </div>' +

                '    <label for="email">Email</label><input type="text" ng-model="vm.userLogin.email">' +
                '    <label ng-show="!vm.forgotMode" for="password">Password</label><input ng-show="!vm.forgotMode" type="password" ng-model="vm.userLogin.password">' +
                '    <input type="submit" class="carli-button login-button" ng-value="vm.submitLabel" busy-click="vm.submitLoginForm()">' +

                '    <div class="toggle-forgot">' +
                '      <a ng-click="vm.toggleForgotMode()">' +
                '        <span ng-show="!vm.forgotMode">I don\'t know my password</span>' +
                '        <span ng-show="vm.forgotMode">Back to Login</span>' +
                '      </a>' +
                '    </div>' +
                '  </form>' +
                '  <div ng-show="vm.resetRequestSent">' +
                '    <p>Your request has been sent.  Please check your email for further instructions.</p>' +
                '    <a ng-click="vm.resetLoginForm()">Return to login</a>' +
                '  </div>' +
                '</section>'
            ].join(''),
            scope: true,
            transclude: true,
            controller: 'loginController',
            controllerAs: 'vm'
        };
    });
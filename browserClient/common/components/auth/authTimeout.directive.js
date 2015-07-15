angular.module('common.auth')
    .directive('authTimeoutAlert', authTimeoutAlert);

function authTimeoutAlert($interval, authTimeoutService, config) {
    return {
        restrict: 'E',
        template: [
            '<div class="underlay" ng-show="shouldShowAlert"></div>',
            '<div class="alert alert-danger" ng-show="shouldShowAlert">',
            '  <div class="message">',
            '    <h1>Hey there!</h1>',
            '    <p ng-show="inWarningPeriod">Your session will expire in {{ countDownString }}.</p>',
            '    <p ng-show="!inWarningPeriod">Your session has ended.</p>',
            '    <p>Thought you\'d like to know.</p>',
            '  </div>',
            '  <div class="actions pull-right">',
            '    <button class="carli-button secondary-button" ng-click="">Sure, whatever.</button>',
            '    <button class="carli-button primary-button" ng-click="">Wait! I\'m not done!</button>',
            '  </div>',
            '</div>'
        ].join("\n"),
        link: authTimeoutAlertLink
    };

    function authTimeoutAlertLink(scope) {
        var timeoutPendingPromise = null;

        scope.shouldShowAlert = false;
        scope.inWarningPeriod = true;
        scope.countDownString = '10 minutes';

        scope.$watch( authTimeoutService.getTimeoutState, function(timeoutState) {
            switch (timeoutState) {
                case authTimeoutService.timeoutStateWarningPeriod:
                    scope.shouldShowAlert = true;
                    scope.inWarningPeriod = true;
                    timeoutPendingPromise = startWarningCounter();
                    break;
                case authTimeoutService.timeoutStateTimedOut:
                    scope.shouldShowAlert = true;
                    scope.inWarningPeriod = false;
                    break;
                default:
                    scope.shouldShowAlert = false;
            }
        });

        function startWarningCounter() {
            var expiresAtTime = new Date().getTime() + config.authMillisecondsUntilWarningAppears;
            var twoMinutes = 1000 * 60 * 2;

            return $interval(updateWarningCounter, 500);

            function updateWarningCounter() {
                var timeNow = new Date().getTime();
                var secondsLeft = Math.floor((expiresAtTime - timeNow) / 1000);

                var minutesRemaining = Math.floor(secondsLeft / 60);
                var secondsRemaining = secondsLeft - (60*minutesRemaining);

                if (secondsRemaining < 10) {
                    secondsRemaining = '0' + secondsRemaining;
                }

                if (minutesRemaining > 2) {
                    scope.countDownString = minutesRemaining + ' minutes';
                } else {
                    scope.countDownString = minutesRemaining + ':' + secondsRemaining + ' minutes';
                }
            }
        }
    }
}

angular.module('common.auth')
    .directive('authTimeoutAlert', authTimeoutAlert);

function authTimeoutAlert($interval, $window, authService, authTimeoutService, config) {
    return {
        restrict: 'E',
        template: [
            '<div class="underlay" ng-show="shouldShowAlert"></div>',
            '<div class="alert alert-danger" ng-show="shouldShowAlert">',
            '  <div class="message">',
            '    <h1>Session Timeout</h1>',
            '    <div ng-show="inWarningPeriod">',
            '      <p>Your session expires after 60 minutes of inactivity.  Any unsaved changes will be lost.</p>',
            '      <p>If you\'re still working you may <a ng-click="refreshSession()">continue your session</a>, or you may <a ng-click="deleteSession()">log out</a> now.</p>',
            '      <p>Your session will expire in {{ countDownMessage }}.</p>',
            '    </div>',
            '    <p ng-show="!inWarningPeriod">Your session has expired.</p>',
            '  </div>',
            '  <div ng-show="inWarningPeriod" class="actions pull-right">',
            '    <button class="carli-button secondary-button" ng-click="deleteSession()">Log out now ({{ countDownTime }})</button>',
            '    <button class="carli-button primary-button" ng-click="refreshSession()">Continue Session</button>',
            '  </div>',
            '  <div ng-show="!inWarningPeriod" class="actions pull-right">',
            '    <button class="carli-button primary-button" ng-click="deleteSession()">Return to Login</button>',
            '  </div>',
            '</div>'
        ].join("\n"),
        link: authTimeoutAlertLink
    };

    function authTimeoutAlertLink(scope) {
        var timeoutPendingPromise = null;

        scope.deleteSession = deleteSession;
        scope.refreshSession = refreshSession;

        link();

        function link() {
            enterState(authTimeoutService.getTimeoutState());

            authService.requireSession().then(function() {
                watchTimeoutState();
            });
        }

        function initialState() {
            scope.shouldShowAlert = false;
            scope.inWarningPeriod = false;
            scope.timedOut = false;
            scope.countDownMessage = '';
        }

        function showWarning() {
            scope.shouldShowAlert = true;
            scope.inWarningPeriod = true;
            timeoutPendingPromise = startWarningCounter();
        }

        function timeOut() {
            scope.shouldShowAlert = true;
            scope.inWarningPeriod = false;
        }

        function watchTimeoutState() {
            return scope.$watch(authTimeoutService.getTimeoutState, function (timeoutState, previousState) {
                if (timeoutState === previousState) {
                    return;
                }
                enterState(timeoutState);
            });
        }

        function enterState(state) {
            switch (state) {
                case authTimeoutService.timeoutStateWarningPeriod:
                    showWarning();
                    break;
                case authTimeoutService.timeoutStateTimedOut:
                    timeOut();
                    break;
                default:
                    initialState();
            }
        }

        function startWarningCounter() {
            var expiresAtTime = new Date().getTime() + config.authWarningDurationInMilliseconds;

            return $interval(updateWarningCounter, 500);

            function updateWarningCounter() {
                var remaining = splitRemainingTime();

                scope.countDownMessage = formatMessage();
                scope.countDownTime = formatTime();

                function splitRemainingTime() {
                    var totalSecondsRemaining = getTotalSecondsLeft();
                    var minutesRemaining = Math.floor(totalSecondsRemaining / 60);
                    var secondsRemaining = getSecondsLeft();

                    return {
                        minutes: minutesRemaining,
                        seconds: secondsRemaining
                    };

                    function getSecondsLeft() {
                        var seconds = totalSecondsRemaining - (60 * minutesRemaining);

                        if (seconds < 10) {
                            seconds = '0' + seconds;
                        }
                        return seconds;
                    }
                }

                function formatMessage() {
                    if (remaining.minutes > 2) {
                        return remaining.minutes + ' minutes';
                    } else {
                        return remaining.minutes + ':' + remaining.seconds + ' minutes';
                    }
                }

                function formatTime() {
                    return remaining.minutes + ':' + remaining.seconds;
                }
            }

            function getTotalSecondsLeft() {
                var timeNow = new Date().getTime();
                return Math.floor((expiresAtTime - timeNow) / 1000);
            }
        }

        function deleteSession() {
            return authService
                .deleteSession()
                .then(initialState)
                .then(refreshPage);

            function refreshPage() {
                $window.location.reload();
            }
        }

        function refreshSession() {
            authTimeoutService.stopLogoutTimeout();
            return authService.refreshSession().then(initialState);
        }
    }
}

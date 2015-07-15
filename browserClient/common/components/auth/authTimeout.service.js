angular.module('common.auth')
    .service('authTimeoutService', authTimeoutService);

function authTimeoutService($timeout, authService, config) {
    var authTimeoutWarningPromise = null;
    var authTimeoutPromise = null;

    var timeoutStateDefault = 'default';
    var timeoutStateWarningPeriod = 'warning';
    var timeoutStateTimedOut = 'timeout';

    var currentState = timeoutStateDefault;

    activate();

    return {
        timeoutStateWarningPeriod: timeoutStateWarningPeriod,
        timeoutStateTimedOut: timeoutStateTimedOut,

        getTimeoutState: getTimeoutState
    };

    function activate() {
        startAuthTimeoutWarningCountdown();
    }

    function getTimeoutState() {
        return currentState;
    }

    function startAuthTimeoutWarningCountdown() {
        stopAuthTimeoutWarningCountdown();
        authTimeoutWarningPromise = $timeout(enterWarningState, config.authWarningDurationInMilliseconds);
    }

    function stopAuthTimeoutWarningCountdown() {
        currentState = timeoutStateDefault;

        if (authTimeoutWarningPromise) {
            $timeout.cancel(authTimeoutWarningPromise);
            authTimeoutWarningPromise = null;
        }
    }

    function enterWarningState() {
        authTimeoutWarningPromise = null;
        authTimeoutPromise = $timeout(enterTimeoutState, config.authMillisecondsUntilWarningAppears);
        currentState = timeoutStateWarningPeriod;
    }

    function enterTimeoutState() {
        currentState = timeoutStateTimedOut;
    }
}

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

        getTimeoutState: getTimeoutState,
        forceTimoutWarning: forceTimeoutWarning
    };

    function activate() {
        startAuthTimeoutWarningCountdown();
    }

    function getTimeoutState() {
        return currentState;
    }

    function startAuthTimeoutWarningCountdown() {
        stopAuthTimeoutWarningCountdown();
        authTimeoutWarningPromise = $timeout(enterWarningState, config.authMillisecondsUntilWarningAppears);
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
        authTimeoutPromise = $timeout(enterTimeoutState, config.authWarningDurationInMilliseconds);
        currentState = timeoutStateWarningPeriod;
    }

    function enterTimeoutState() {
        currentState = timeoutStateTimedOut;
    }

    function forceTimeoutWarning() {
        config.authMillisecondsUntilWarningAppears = 1000;
        config.authWarningDurationInMilliseconds = 60000;
        startAuthTimeoutWarningCountdown();
    }
}

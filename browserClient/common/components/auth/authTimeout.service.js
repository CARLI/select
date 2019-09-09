angular.module('common.auth')
    .service('authTimeoutService', authTimeoutService);

function authTimeoutService($timeout, config) {
    var authTimeoutWarningPromise = null;
    var authTimeoutPromise = null;

    var timeoutStateDefault = 'default';
    var timeoutStateWarningPeriod = 'warning';
    var timeoutStateTimedOut = 'timeout';

    var currentState = timeoutStateDefault;

    config.waitForConfigToLoad().then(activate);

    return {
        timeoutStateWarningPeriod: timeoutStateWarningPeriod,
        timeoutStateTimedOut: timeoutStateTimedOut,
        getTimeoutState: getTimeoutState,
        stopLogoutTimeout: stopLogoutTimeout
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
        cancelAuthTimeoutWarningPromise();
    }

    function enterWarningState() {
        cancelAuthTimeoutWarningPromise();
        startLogoutTimeout();
        currentState = timeoutStateWarningPeriod;
    }

    function startLogoutTimeout() {
        authTimeoutPromise = $timeout(enterTimeoutState, config.authWarningDurationInMilliseconds);
    }

    function stopLogoutTimeout() {
        cancelAuthTimeoutPromise();
        startAuthTimeoutWarningCountdown();
    }

    function enterTimeoutState() {
        currentState = timeoutStateTimedOut;
    }

    function cancelAuthTimeoutWarningPromise() {
        if (authTimeoutWarningPromise) {
            $timeout.cancel(authTimeoutWarningPromise);
            authTimeoutWarningPromise = null;
        }
    }
    function cancelAuthTimeoutPromise() {
        if (authTimeoutPromise) {
            $timeout.cancel(authTimeoutPromise);
            authTimeoutPromise = null;
        }
    }
}

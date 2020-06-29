angular.module('common.alerts')
    .service('alertService', alertService);

function alertService($timeout, config) {
    var alerts = [];
    var defaultOptions = {
        expireAfter: config.alertTimeout,
        severity: 'info'
    };

    function getAlerts() {
        return alerts;
    }

    function putAlert(message, options) {
        var opts = angular.extend({}, defaultOptions, options);

        if (!message) {
            return false;
        }

        var alert = { message: message, severity: opts.severity };
        alerts.push(alert);
        //_expireAlert(alert, opts.expireAfter);
        return alert;
    }

    function _expireAlert(alert, expireAfter) {
            $timeout(function () {
                clearAlert(alert);
            }, expireAfter);
        }

    function clearAlert(alert) {
        var idx = alerts.indexOf(alert);
        if (idx >= 0) {
            alerts.splice(idx, 1);
        }
    }

    return {
        getAlerts: getAlerts,
        putAlert: putAlert,
        clearAlert: clearAlert
    };
}


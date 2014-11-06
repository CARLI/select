angular.module('carli.alerts')
    .service('alertService', alertService);

function alertService() {
    var alerts = [];

    function getAlerts() {
        return alerts;
    }
    function putAlert(message) {
        if (!message) {
            return false;
        }
        var alert = {
            message: message
        };
        alerts.push(alert);
        return alert;
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


angular.module('carli.mockAlertService', [])
    .factory('mockAlertService', function mockAlertService($q) {
        return {
            alertCount: 0,
            putAlert: function () {
                this.alertCount++;
            }
        };
    });
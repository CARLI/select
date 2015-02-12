angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($http, config) {
    function sendNotification(envelope) {
        var url = config.getMiddlewareUrl() + '/tell-pixobot';
        $http.put(url, envelope);
    }
    return {
        sendNotification: sendNotification
    };
}
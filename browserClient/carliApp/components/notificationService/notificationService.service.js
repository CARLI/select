angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($http, CarliModules, config) {

    var notificationModule = CarliModules.Notification;

    return {
        list:   function() { return $q.when( notificationModule.list() ); },
        create: function() { return $q.when( notificationModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( notificationModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( notificationModule.load.apply(this, arguments) ); },
        sendNotification: sendNotification
    };

    function sendNotification(envelope) {
        var url = config.getMiddlewareUrl() + '/tell-pixobot';
        $http.put(url, envelope);
    }
}

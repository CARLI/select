angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($q, $http, CarliModules, config) {

    var notificationModule = CarliModules.Notification;

    return {
        getBlankNotification: getBlankNotification,
        list:   function() { return $q.when( notificationModule.list() ); },
        listDrafts: function() { return $q.when( notificationModule.listDrafts() ); },
        listSent: function() { return $q.when( notificationModule.listSent() ); },
        create: function() { return $q.when( notificationModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( notificationModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( notificationModule.load.apply(this, arguments) ); },
        createNotificationsFor: createNotificationsFor,
        sendNotification: sendNotification
    };

    function getBlankNotification(){
        return {
            type: 'Notification',
            subject: '',
            emailBody: '',
            recipients: '',
            draftStatus: 'draft'
        };
    }

    function createNotificationsFor( spec ){
        return notificationModule.create(spec);
    }

    function sendNotification(envelope) {
        var url = config.getMiddlewareUrl() + '/tell-pixobot';
        $http.put(url, envelope);
    }
}

angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($q, $http, CarliModules, config) {

    var notificationModule = CarliModules.Notification;

    return {
        getBlankNotification: getBlankNotification,
        list:   function() { return $q.when( notificationModule.list() ); },
        listDrafts: listDrafts,
        listSent: listSent,
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
        return $q.when(true);
    }

    function sendNotification(envelope) {
        var url = config.getMiddlewareUrl() + '/tell-pixobot';
        $http.put(url, envelope);
    }

    function listDrafts(){
        return notificationModule.list()
            .then(keepUnsentNotifications);

        function keepUnsentNotifications(notifications){
            return notifications.filter(function(notification){
                return notification.draftStatus === 'draft';
            });
        }
    }

    function listSent(){
        return notificationModule.list()
            .then(keepSentNotifications);

        function keepSentNotifications(notifications){
            return notifications.filter(function(notification){
                return notification.draftStatus === 'sent';
            });
        }
    }
}

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
        sendNotification: sendNotification,
        removeNotification: function() { return $q.when( notificationModule.delete.apply(this, arguments)); },
        getRecipientLabel: notificationModule.getRecipientLabel,
        notificationTypeIsForLibrary: notificationModule.notificationTypeIsForLibrary,
        notificationTypeIsForVendor: notificationModule.notificationTypeIsForVendor
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

    function sendNotification(notification) {
        var url = config.getMiddlewareUrl() + '/tell-pixobot';
        return $http.put(url, notification)
            .then(function(){
                notification.draftStatus = 'sent';
                notification.dateSent = new Date();

                return notificationModule.update(notification);
            });
    }
}

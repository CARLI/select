angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($q, $http, CarliModules, config) {

    var notificationModule = CarliModules.Notification;

    return {
        getBlankNotification: getBlankNotification,
        list:   function() { return $q.when( notificationModule.list() ); },
        listDrafts: function() { return $q.when( notificationModule.listDrafts() ); },
        listSent: function() { return $q.when( notificationModule.listSent() ); },
        listSentBetweenDates: function(startDate, endDate) { return $q.when( notificationModule.listSentBetweenDates(startDate, endDate) ); },
        create: function() { return $q.when( notificationModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( notificationModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( notificationModule.load.apply(this, arguments) ); },
        delete:   function() { return $q.when( notificationModule.delete.apply(this, arguments) ); },
        sendNotification: sendNotification,
        removeNotification: function() { return $q.when( notificationModule.delete.apply(this, arguments)); },
        getRecipientLabel: notificationModule.getRecipientLabel,
        generateDraftNotification: CarliModules.NotificationDraftGenerator.generateDraftNotification
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

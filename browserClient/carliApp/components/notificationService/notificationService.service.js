angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($q, CarliModules, errorHandler) {

    var notificationModule = CarliModules.Notification;

    return {
        getBlankNotification: getBlankNotification,
        list:   function() { return $q.when( notificationModule.list() ).catch(errorHandler); },
        listDrafts: function() { return $q.when( notificationModule.listDrafts() ).catch(errorHandler); },
        listSent: function() { return $q.when( notificationModule.listSent() ).catch(errorHandler); },
        listSentBetweenDates: function(startDate, endDate) { return $q.when( notificationModule.listSentBetweenDates(startDate, endDate) ).catch(errorHandler); },
        create: function() { return $q.when( notificationModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( notificationModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( notificationModule.load.apply(this, arguments) ).catch(errorHandler); },
        delete:   function() { return $q.when( notificationModule.delete.apply(this, arguments) ); },
        sendNotification: function() { return $q.when( notificationModule.sendNotification.apply(this, arguments) ); },
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
}

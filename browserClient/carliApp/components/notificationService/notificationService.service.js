angular.module('carli.notificationService')
    .factory('notificationService', notificationService);

function notificationService($q, CarliModules, errorHandler) {

    var notificationModule = CarliModules.Notification;
    var emailMiddleware = CarliModules.EmailMiddleware;

    return {
        getBlankNotification: getBlankNotification,
        list:   function() { return $q.when( notificationModule.list() ).catch(errorHandler); },
        listDrafts: function() { return $q.when( notificationModule.listDrafts() ).catch(errorHandler); },
        listSent: function() { return $q.when( notificationModule.listSent() ).catch(errorHandler); },
        listSentBetweenDates: function(startDate, endDate) { return $q.when( notificationModule.listSentBetweenDates(startDate, endDate) ).catch(errorHandler); },
        listAllContacts: function() { return $q.when( notificationModule.listAllContacts.apply(this, arguments) ); },
        create: function() { return $q.when( notificationModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( notificationModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( notificationModule.load.apply(this, arguments) ).catch(errorHandler); },
        delete:   function() { return $q.when( notificationModule.delete.apply(this, arguments) ); },
        sendNotification: sendNotification,
        resend: resend,
        removeNotification: function() { return $q.when( notificationModule.delete.apply(this, arguments)); },
        getRecipientLabel: notificationModule.getRecipientLabel,
        generateDraftNotification: CarliModules.NotificationDraftGenerator.generateDraftNotification,
        notificationTypeAllowsRecipientsToBeEdited: notificationModule.notificationTypeAllowsRecipientsToBeEdited,
        templateIsForMembershipDues: notificationModule.templateIsForMembershipDues
    };

    function sendNotification(notification){
        return $q.when( notificationModule.sendNotification(notification) )
            .then(function(){
                return $q.when(emailMiddleware.sendNotificationEmail(notification.id));
            });
    }

    function resend(notification){
        return $q.when(emailMiddleware.sendNotificationEmail(notification.id));
    }

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

angular.module('carli.notificationTemplateService')
    .service('notificationTemplateService', notificationTemplateService);

function notificationTemplateService( CarliModules, $q ) {

    var notificationTemplateModule = CarliModules.NotificationTemplate;

    return {
        list:   function() { return $q.when( notificationTemplateModule.list() ); },
        create: function() { return $q.when( notificationTemplateModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( notificationTemplateModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( notificationTemplateModule.load.apply(this, arguments) ); }
    };
}

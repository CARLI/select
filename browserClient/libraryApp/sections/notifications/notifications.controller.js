angular.module('library.sections.notifications')
    .controller('notificationsController', notificationsController);

function notificationsController($q, CarliModules) {
    var vm = this;

    var libraryMiddleware = CarliModules.LibraryMiddleware;

    vm.loadingPromise = null;
    vm.notifications = [];

    activate();

    function activate() {
        initVmLibrary();
    }

    function initVmLibrary() {
        vm.loadingPromise = loadNotificationsForLibrary()
            .then(notifications => notifications.filter(notification => notification.dateCreated > "2023-01-01T00:00"))
            .then(function(notifications){
                vm.notifications = notifications;
            });
        return vm.loadingPromise;
    }

    function loadNotificationsForLibrary() {
        return $q.when(libraryMiddleware.listNotificationsForLibrary());
    }
}
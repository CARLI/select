angular.module('library.sections.notifications')
    .controller('notificationsController', notificationsController);

function notificationsController(notificationService, userService) {
    var vm = this;

    var currentUser = userService.getUser();
    var currentLibrary = currentUser.library;

    vm.library = null;
    vm.loadingPromise = null;

    activate();

    function activate() {
        initVmLibrary();
    }

    function initVmLibrary() {
        vm.loadingPromise = libraryService.load(currentLibrary.id)
            .then(function (library) {
                vm.library = library;
            })
            .then(loadNotificationsForLibrary);
        return vm.loadingPromise;
    }

    function loadNotificationsForLibrary() {
        notificationService
    }
}
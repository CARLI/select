angular.module('library.sections.ipAddresses')
    .controller('ipAddressesController', ipAddressesController);

function ipAddressesController($q, $scope, libraryService, userService, activityLogService) {
    var vm = this;

    var currentUser = userService.getUser();
    var currentLibrary = currentUser.library;

    vm.library = null;
    vm.loadingPromise = null;

    vm.cancelEdit = cancelEdit;
    vm.save = save;

    activate();

    function activate() {
        initVmLibrary();
    }

    function initVmLibrary() {
        vm.loadingPromise = libraryService.load(currentLibrary.id)
            .then(function (library) {
                vm.library = library;
            });
        return vm.loadingPromise;
    }

    function cancelEdit() {
        return initVmLibrary()
            .then(setFormPristine);
    }

    function save() {
        vm.loadingPromise = libraryService.update(vm.library)
            .then(logIpAddressesModified)
            .then(initVmLibrary)
            .then(setFormPristine);
        return vm.loadingPromise;
    }

    function logUpdateActivity(){
        return activityLogService.logEntityModified(vm.library, 'library');
    }

    function setFormPristine(){
        if ($scope.ipEditForm) {
            $scope.ipEditForm.$setPristine();
        }
    }

    function logIpAddressesModified(){
        var activity = {
            actionDescription: 'Modified IP Address data',
            app: 'library',
            category: 'libraryModified',
            libraryId: vm.library.id,
            libraryName: vm.library.name
        };

        return activityLogService.logActivity(activity);
    }
}

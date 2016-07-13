angular.module('library.navBar')
    .controller('navBarController', navBarController);

function navBarController(cycleService, userService) {
    var vm = this;

    vm.showOpenBadge = false;
    vm.userIsReadOnly = userService.userIsReadOnly;

    activate();

    function activate() {
        cycleService.listActiveCycles()
            .then(function (cycles) {
                cycles.forEach(showOpenBadgeIfCycleOpen);
            });
    }

    function showOpenBadgeIfCycleOpen(cycle) {
        if ( cycle.status == cycleService.CYCLE_STATUS_OPEN_TO_LIBRARIES ) {
            vm.showOpenBadge = true;
        }
    }

}

angular.module('library.navBar')
    .controller('navBarController', navBarController);

function navBarController(cycleService) {
    var vm = this;

    vm.showOpenBadge = false;

    activate();

    function activate() {
        cycleService.listActiveCycles()
            .then(function (cycles) {
                cycles.forEach(showOpenBadgeIfCycleOpen);
            });
    }

    function showOpenBadgeIfCycleOpen(cycle) {
        if ( cycle.status == cycle.CYCLE_STATUS_OPEN_TO_LIBRARIES ) {
            vm.showOpenBadge = true;
        }
    }

}

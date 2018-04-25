angular.module('library.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController( cycleService, persistentState, userService ){
    var vm = this;

    var toggleArchivedListKey = 'hideArchivedCyclesOnLibraryDashboard';

    vm.cycles = [];
    vm.archivedCycles = [];

    vm.hideArchivedCycleList = persistentState.getState(toggleArchivedListKey, true);
    vm.library = {};
    vm.loadingPromise = null;
    vm.cycleForUnselectedProducts = null;
    vm.selectedLicenseId = null;
    vm.userIsReadOnly = userService.userIsReadOnly;

    vm.showLicenseAgreements = showLicenseAgreements;
    vm.toggleArchivedCycleList = toggleArchivedCycleList;
    vm.viewUnselectedProductsFor = viewUnselectedProductsFor;

    activate();


    function activate(){
        vm.library = userService.getUser().library;

        vm.loadingPromise = cycleService.list()
            .then(filterToClosedOrArchivedCyclesOnly)
            .then(partitionCyclesIntoActiveAndArchived);

        return vm.loadingPromise;

        function filterToClosedOrArchivedCyclesOnly(listOfCycles) {
            return listOfCycles.filter(cycleIsClosed);

            function cycleIsClosed(cycle) {
                return cycle.status >= cycleService.CYCLE_STATUS_CLOSED;
            }
        }

        function partitionCyclesIntoActiveAndArchived(allCycles) {
            var active = [];
            var archived = [];

            allCycles.forEach(function (cycle) {
                if (cycle.isArchived)
                    archived.push(cycle);
                else
                    active.push(cycle);
            });

            vm.cycles = active.sort(cyclesByYearAndName);
            vm.archivedCycles = archived.sort(cyclesByYearAndName);
        }
    }

    function cyclesByYearAndName(c1, c2) {
        if (c1.year == c2.year)
            return c1.name > c2.name;
        return c1.year < c2.year;
    }

    function viewUnselectedProductsFor(cycle){
        vm.cycleForUnselectedProducts = cycle;
        $('#unselected-products-modal').modal(true);
    }

    function showLicenseAgreements(licenseId){
        vm.selectedLicenseId = licenseId;
        $('#redacted-license-popup').modal(true);
    }


    function toggleArchivedCycleList() {
        vm.hideArchivedCycleList = !vm.hideArchivedCycleList;
        persistentState.setState(toggleArchivedListKey, vm.hideArchivedCycleList);
    }
}

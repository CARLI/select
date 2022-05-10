angular.module('carli.sections.subscriptions')
    .controller('subscriptionsController', subscriptionsController);

function subscriptionsController($scope, activityLogService, alertService, cycleService, errorHandler, persistentState, userService) {
    var vm = this;

    var toggleArchivedListKey = 'hideArchivedCyclesOnSubscriptionsListPage';

    vm.cyclesLoading = null;
    vm.archiveCycle = archiveCycle;
    vm.editCycle = editCycle;
    vm.cancelEdit = cancelEdit;
    vm.saveCycleDates = saveCycleDates;
    vm.toggleArchivedCycleList = toggleArchivedCycleList;
    vm.unarchiveCycle = unarchiveCycle;

    vm.activeCycles = [];
    vm.archivedCycles = [];
    vm.cycleBeingEdited = null;
    vm.cycleClosed = cycleService.CYCLE_STATUS_CLOSED;
    vm.hideArchivedCycleList = persistentState.getState(toggleArchivedListKey, true);

    var startDateForSelections = null;
    var endDateForSelections = null;
    var productsAvailableDate = null;

    activate();
    function activate() {
        vm.userIsReadOnly = userService.userIsReadOnly();
        vm.cyclesLoading = cycleService.list()
            .then(function (allCycles) {
                var active = [];
                var archived = [];
                var ignored = [];

                allCycles.forEach(function (cycle) {
                    if ( cycle.cycleType === 'One-Time Purchase' )
                        ignored.push(cycle);
                    else if ( cycle.isArchived )
                        archived.push(cycle);
                    else
                        active.push(cycle);
                });

                vm.activeCycles = active.sort(cyclesByYearAndName);
                vm.archivedCycles = archived.sort(cyclesByYearAndName);
            });

        return vm.cyclesLoading;
    }

    function cyclesByYearAndName(c1, c2) {
        if (c1.year == c2.year)
            return c1.name > c2.name;
        return c1.year < c2.year;
    }

    function editCycle(cycle) {
        vm.cycleBeingEdited = cycle;
        startDateForSelections = cycle.startDateForSelections;
        endDateForSelections = cycle.endDateForSelections;
        productsAvailableDate = cycle.productsAvailableDate;
        console.log("Editing", cycle);
    }

    function archiveCycle(cycle) {
        if (window.confirm('Are you sure you want to archive ' + cycle.name + '?')) {
            return cycleService.archiveCycle(cycle)
                .then(activate)
                .then(function () {
                    alertService.putAlert('Cycle archived', {severity: 'success'});
                });
        }
    }

    function unarchiveCycle(cycle) {
        if (window.confirm('Are you sure you want to un-archive ' + cycle.name + '?')) {
            return cycleService.unarchiveCycle(cycle)
                .then(activate)
                .then(function () {
                    alertService.putAlert('Cycle un-archived', {severity: 'success'});
                });
        }
    }

    function cancelEdit() {
        $('#edit-cycle-dates-modal').one('hidden.bs.modal', function (e) {
            console.log("Cancelling date changes");
            $scope.$apply(function () {
                vm.cycleBeingEdited.startDateForSelections = startDateForSelections;
                vm.cycleBeingEdited.endDateForSelections = endDateForSelections;
                vm.cycleBeingEdited.productsAvailableDate = productsAvailableDate;
            });
        });
        $('#edit-cycle-dates-modal').modal('hide');
    }

    function saveCycleDates() {
        return cycleService.update(vm.cycleBeingEdited)
            .then(cycleService.load)
            .then(function (cycle) {
                vm.cycleBeingEdited._rev = cycle._rev;
                $('#edit-cycle-dates-modal').modal('hide');
                alertService.putAlert('Cycle dates saved', {severity: 'success'});
                startDateForSelections = vm.cycleBeingEdited.startDateForSelections;
                endDateForSelections = vm.cycleBeingEdited.endDateForSelections;
                productsAvailableDate = vm.cycleBeingEdited.productsAvailableDate;
            })
            .then(function () {
                return activityLogService.logCycleDateUpdate(vm.cycleBeingEdited);
            })
            .catch(errorHandler);
    }

    function toggleArchivedCycleList() {
        vm.hideArchivedCycleList = !vm.hideArchivedCycleList;
        persistentState.setState(toggleArchivedListKey, vm.hideArchivedCycleList);
    }
}

angular.module('carli.sections.subscriptions')
    .controller('subscriptionsController', subscriptionsController);

function subscriptionsController($scope, activityLogService, alertService, cycleService, errorHandler) {
    var vm = this;

    vm.editCycle = editCycle;
    vm.cancelEdit = cancelEdit;
    vm.saveCycleDates = saveCycleDates;

    vm.cycleBeingEdited = null;

    var startDateForSelections = null;
    var endDateForSelections = null;
    var productsAvailableDate = null;

    activate();
    function activate() {
        cycleService.listActiveSubscriptionCycles().then(function (activeCycles) {
            vm.cycles = activeCycles.sort(sortActiveCycles);
        });
    }

    function sortActiveCycles(c1, c2) {
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
}

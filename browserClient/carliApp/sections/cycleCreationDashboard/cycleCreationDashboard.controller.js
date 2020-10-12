angular.module('carli.sections.cycleCreationDashboard')
    .controller('cycleCreationDashboardController', cycleCreationDashboardController);

function cycleCreationDashboardController($scope, activityLogService, alertService, cycleCreationJobsService, errorHandler, persistentState) {
    var vm = this;
    vm.jobsLoading = null;
    vm.activeJobs = [];

    activate();

    function activate() {
        vm.jobsLoading = cycleCreationJobsService.list()
            .then(function (allJobs) {
                vm.activeJobs = allJobs;
            });

        return vm.jobsLoading;
    }
}

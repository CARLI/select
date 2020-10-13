angular.module('carli.sections.cycleCreationDashboard')
    .controller('cycleCreationDashboardController', cycleCreationDashboardController);

function cycleCreationDashboardController($scope, activityLogService, alertService, cycleCreationJobService, errorHandler, persistentState) {
    var vm = this;
    vm.jobsLoading = null;
    vm.activeJobs = [];

    activate();

    function activate() {
        vm.jobsLoading = cycleCreationJobService.list()
            .then(function (allJobs) {
                vm.activeJobs = allJobs.map(job => {
                    return {
                        ...job,
                        status: getStatusForJob(job)
                    }
                });
            });

        return vm.jobsLoading;
    }

    function getStatusForJob(job) {
        if(job.completed)
            return "Completed";

        if(job.running)
            return "Running";

        return "Stopped";
    }
}

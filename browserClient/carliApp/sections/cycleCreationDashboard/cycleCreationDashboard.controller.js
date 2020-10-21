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
                    const jobStatus = cycleCreationJobService.getStatusForJob(job);

                    return {
                        ...job,
                        status: jobStatus,
                        canResume: jobStatus !== "Completed",
                        hasMessages: job.messages && (job.messages.length > 0)
                    };
                });
            });

        return vm.jobsLoading;
    }
}

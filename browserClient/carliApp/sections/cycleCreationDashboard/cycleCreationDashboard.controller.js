angular.module('carli.sections.cycleCreationDashboard')
    .controller('cycleCreationDashboardController', cycleCreationDashboardController);

function cycleCreationDashboardController($scope, activityLogService, alertService, cycleCreationJobService, errorHandler, persistentState) {
    var vm = this;
    vm.jobsLoading = null;
    vm.activeJobs = [];
    vm.resumeJob = resumeJob;

    activate();

    function activate() {
        vm.jobsLoading = cycleCreationJobService.list()
            .then(function (allJobs) {
                vm.activeJobs = allJobs.map(job => {
                    const jobStatus = cycleCreationJobService.getStatusForJob(job);
                    return {
                        ...job,
                        status: jobStatus,
                        canResume: jobStatus !== "Completed"
                    };
                });
            });

        return vm.jobsLoading;
    }

    function resumeJob(job) {
        console.log("yo we want to resume this job");
        console.log(job);

        var creationPromise;
        if (vm.sourceCycle && vm.sourceCycle.getDatabaseName && vm.targetCycle && vm.targetCycle.getDatabaseName()) {
            creationPromise = cycleCreationJobService.resumeCycle(vm.cycle);
        }
    }
}

angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .controller('cycleDataProcessingController', cycleDataProcessingController);

function cycleDataProcessingController($q, $routeParams, $scope, $interval, cycleCreationJobService) {
    var vm = this;

    var cycleId = $routeParams.id;
    var updateInterval = 5000;
    var updateIntervalPromise = null;

    vm.job = null;
    vm.noMatchingJobsFound = false;

    activate();

    function activate() {
        updateIntervalPromise = $interval(updateCycleCreationStatus, updateInterval);
        updateCycleCreationStatus();

        $scope.$on("$destroy", cancelUpdateTimer);
    }

    function updateCycleCreationStatus() {
        vm.jobsLoading = cycleCreationJobService.list()
            .then(function (allJobs) {
                var matchingJobs = allJobs.filter(function (job) {
                    return job.targetCycle.id === cycleId
                })

                if(matchingJobs.length === 0) {
                    vm.noMatchingJobsFound = true;
                } else {
                    const job = matchingJobs[0];
                    const jobStatus = cycleCreationJobService.getStatusForJob(job);
                    vm.job = {
                        ...job,
                        status: jobStatus,
                        canResume: jobStatus !== "Completed"
                    };
                }
            });
    }

    function cancelUpdateTimer() {
        if (updateIntervalPromise) {
            $interval.cancel(updateIntervalPromise);
        }
    }
}

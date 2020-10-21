angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .controller('cycleDataProcessingController', cycleDataProcessingController);

function cycleDataProcessingController($q, $routeParams, $scope, $interval, cycleCreationJobService) {
    var vm = this;

    var cycleId = $routeParams.id;
    var updateInterval = 5000;
    var updateIntervalPromise = null;

    vm.job = null;

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

                if(matchingJobs.length === 0)
                    return;

                vm.job = matchingJobs.map(job => {
                    const jobStatus = cycleCreationJobService.getStatusForJob(job);
                    return {
                        ...job,
                        status: jobStatus,
                        canResume: jobStatus !== "Completed"
                    };
                })[0];
            });
    }

    function cancelUpdateTimer() {
        if (updateIntervalPromise) {
            $interval.cancel(updateIntervalPromise);
        }
    }
}

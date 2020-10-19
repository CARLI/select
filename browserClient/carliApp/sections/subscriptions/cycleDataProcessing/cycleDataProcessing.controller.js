angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .controller('cycleDataProcessingController', cycleDataProcessingController);

function cycleDataProcessingController($q, $routeParams, $scope, $interval, cycleCreationJobService) {
    var vm = this;

    var cycleId = $routeParams.id;
    var updateInterval = 2000;
    var updateIntervalPromise = null;

    vm.jobs = [];

    activate();

    function activate() {
        updateIntervalPromise = $interval(updateCycleCreationStatus, updateInterval);

        $scope.$on("$destroy", cancelUpdateTimer);
    }

    function updateCycleCreationStatus() {
        vm.jobsLoading = cycleCreationJobService.list()
            .then(function (allJobs) {
                var matchingJobs = allJobs.filter(function (job) {
                    return job.targetCycle.id === cycleId
                })

                vm.jobs = matchingJobs.map(job => {
                    const jobStatus = cycleCreationJobService.getStatusForJob(job);
                    return {
                        ...job,
                        status: jobStatus,
                        canResume: jobStatus !== "Completed"
                    };
                });
            });
    }

    function cancelUpdateTimer() {
        if (updateIntervalPromise) {
            $interval.cancel(updateIntervalPromise);
        }
    }
}

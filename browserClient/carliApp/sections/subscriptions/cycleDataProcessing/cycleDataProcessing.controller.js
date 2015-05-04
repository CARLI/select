angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .controller('cycleDataProcessingController', cycleDataProcessingController);

function cycleDataProcessingController( $q, $routeParams, $scope, $interval, cycleService ) {
    var vm = this;

    var cycleId = $routeParams.id;
    var updateInterval = 2000;
    var updateIntervalPromise = null;

    vm.progress = {
        replication: 0,
        firstViewIndexing: 0,
        offeringTransformation: 0,
        secondViewIndexing: 0
    };

    activate();

    function activate(){
        cycleService.load(cycleId).then(function(cycle){
            vm.cycle = cycle;
            updateCycleCreationStatus();
            updateIntervalPromise = $interval(updateCycleCreationStatus, updateInterval);
        });

        $scope.$on("$destroy", cancelUpdateTimer);
    }

    function updateCycleCreationStatus() {
        cycleService.fakeCycleCreationStatus(cycleId).then(function (status) {
            if (vm.progress.replication < 100) {
                vm.progress.replication = status.replication;
            } else if (vm.progress.firstViewIndexing < 100) {
                vm.progress.firstViewIndexing = status.viewIndexing;
            } else if (vm.progress.offeringTransformation < 100) {
                vm.progress.offeringTransformation = status.offeringTransformation;
            } else if (vm.progress.secondViewIndexing < 100) {
                vm.progress.secondViewIndexing = status.viewIndexing;
            } else {
                updateComplete();
            }
        });
    }

    function updateComplete(){
        cancelUpdateTimer();
        vm.cycleRouter.next();
    }

    function cancelUpdateTimer(){
        if (updateIntervalPromise) {
            $interval.cancel(updateIntervalPromise);
        }
    }
}

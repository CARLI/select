angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .controller('cycleDataProcessingController', cycleDataProcessingController);

function cycleDataProcessingController( $q, $routeParams, $scope, $interval, cycleService ) {
    var vm = this;

    var cycleId = $routeParams.id;
    var updateInterval = 2000;
    var updateIntervalPromise = null;
    var trustFirstViewIndex = false;
    var trustSecondViewIndex = false;

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
            updateIntervalPromise = $interval(updateCycleCreationStatus, updateInterval);
        });

        $scope.$on("$destroy", cancelUpdateTimer);
    }

    function updateCycleCreationStatus() {
        cycleService.getCycleCreationStatus(cycleId).then(function (status) {
            determineTrustOfIndexingStatus(status);
            var currentStep = determineCurrentStep(status);
            console.log(status, 'Current step is ', currentStep, ' trust index statuses? ', trustFirstViewIndex, trustSecondViewIndex);

            if (currentStep === 1) {
                vm.progress.replication = status.replication;
                vm.progress.firstViewIndexing = 0;
                vm.progress.offeringTransformation = 0;
                vm.progress.secondViewIndexing = 0;
            } else if (currentStep === 2) {
                vm.progress.replication = 100;
                vm.progress.firstViewIndexing = trustFirstViewIndex ? status.viewIndexing : 0;
                vm.progress.offeringTransformation = 0;
                vm.progress.secondViewIndexing = 0;
            } else if (currentStep === 3) {
                vm.progress.replication = 100;
                vm.progress.firstViewIndexing = 100;
                vm.progress.offeringTransformation = Math.floor(status.offeringTransformation);
                vm.progress.secondViewIndexing = 0;
            } else if (currentStep === 4) {
                vm.progress.replication = 100;
                vm.progress.firstViewIndexing = 100;
                vm.progress.offeringTransformation = 100;
                vm.progress.secondViewIndexing = trustSecondViewIndex ? status.viewIndexing : 0;
            } else {
                vm.progress.replication = 100;
                vm.progress.firstViewIndexing = 100;
                vm.progress.offeringTransformation = 100;
                vm.progress.secondViewIndexing = 100;
                updateComplete();
            }
        });

        function determineTrustOfIndexingStatus(status) {
            if (vm.progress.offeringTransformation > 0) {
                trustFirstViewIndex = true;
            }
            if (!trustFirstViewIndex && status.viewIndexing < 100) {
                trustFirstViewIndex = true;
            }
            if (trustFirstViewIndex && vm.progress.firstViewIndexing == 100 && status.viewIndexing < 100) {
                trustSecondViewIndex = true;
            }
        }

        function determineCurrentStep(status) {
            if (status.replication < 100) {
                return 1;
            }
            if ( !trustFirstViewIndex || (status.offeringTransformation === 0 && !trustSecondViewIndex && status.viewIndexing < 100) ) {
                return 2;
            }
            if (status.offeringTransformation < 100) {
                return 3;
            }
            if ( !trustSecondViewIndex || (trustSecondViewIndex && status.viewIndexing < 100) ) {
                return 4;
            }
            return 5;
        }
    }

    function updateComplete(){
        cancelUpdateTimer();
        vm.cycleRouter.updateStatus();
    }

    function cancelUpdateTimer(){
        if (updateIntervalPromise) {
            $interval.cancel(updateIntervalPromise);
        }
    }
}

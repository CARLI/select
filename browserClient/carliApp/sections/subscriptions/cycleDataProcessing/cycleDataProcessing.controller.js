angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .controller('cycleDataProcessingController', cycleDataProcessingController);

function cycleDataProcessingController( $q, $routeParams, $scope, $interval, cycleService ) {
    var vm = this;
    var updateInterval = 2000;
    var updateIntervalPromise = null;

    vm.progress = 0;

    activate();


    function activate(){
        cycleService.load($routeParams.id).then(function(cycle){
            vm.cycle = cycle;
            updateCouchViewStatus();

            updateIntervalPromise = $interval(updateCouchViewStatus, updateInterval);
        });

        $scope.$on("$destroy", cancelUpdateTimer);
    }

    function updateCouchViewStatus(){
//        $q.when(vm.cycle.getViewUpdateProgress()).then(function(progress){
//            vm.progress = progress;
//
//            if ( progress >= 100 ){
//                updateComplete();
//            }
//        });
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

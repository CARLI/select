angular.module('library.unselectedProducts')
    .controller('unselectedProductsController', unselectedProductsController);

function unselectedProductsController($scope){
    var vm = this;

    vm.loadingPromise = null;

    activate();

    function activate(){
        console.log('unselectedProductsController Activate');

        $scope.$watch('cycle', cycleUpdated);
    }

    function cycleUpdated(newCycle){
        console.log('  cycle updated', newCycle);

        if ( newCycle ){
            loadUnselectedProductsForCycle();
        }
        else {
            hideUnselectedProductsModal();
        }
    }

    function loadUnselectedProductsForCycle(){
        vm.loadingPromise = $scope.cycle.id;
        console.log('    show modal');
    }

    function hideUnselectedProductsModal(){
        console.log('    hide modal');
    }
}
angular.module('library.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController( $anchorScroll, $location, $scope, cycleService, userService ){
    var vm = this;

    vm.cycles = [];
    vm.library = {};

    activate();


    function activate(){
        console.log('activate');

        $scope.$on('$locationChangeStart', function(event, next, current) {
            console.log('location change');
        });

        vm.library = userService.getUser().library;

        cycleService.listActiveCycles().then(function(cycleList){
            vm.cycles = cycleList;
        });
    }
}

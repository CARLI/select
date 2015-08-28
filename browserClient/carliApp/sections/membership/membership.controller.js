angular.module('carli.sections.membership')
.controller('membershipController', membershipController);

function membershipController( $location, $routeParams, libraryService ){
    var vm = this;

    vm.currentYear = new Date().getFullYear();
    vm.libraries = [];
    vm.loadingPromise = null;
    vm.displayYear = null;

    activate();

    function activate(){
        vm.displayYear = $routeParams.year;

        if ( vm.displayYear ){
            initializeMembershipData();
        }
        else {
            routeToDefaultYear();
        }
    }

    function routeToDefaultYear(){
        $location.path('/membership/' + vm.currentYear);
    }

    function initializeMembershipData(){
        vm.loadingPromise = libraryService.list()
            .then(function(libraryList){
                vm.libraries = libraryList;
            });

        return vm.loadingPromise;
    }
}

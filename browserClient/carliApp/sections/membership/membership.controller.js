angular.module('carli.sections.membership')
.controller('membershipController', membershipController);

function membershipController( $location, $routeParams, libraryService, membershipService ){
    var vm = this;

    vm.currentYear = new Date().getFullYear();
    vm.libraries = [];
    vm.loadingPromise = null;
    vm.displayYear = null;
    vm.membershipData = null;

    vm.saveMembershipData = saveMembershipData;
    vm.ishareTotal = ishareTotal;
    vm.membershipTotal = membershipTotal;
    vm.grandTotal = grandTotal;

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
        vm.loadingPromise = libraryService.listActiveLibraries()
            .then(function(libraryList){
                vm.libraries = libraryList;
                return vm.libraries;
            })
            .then(loadMembershipDataForDisplayYear)
            .then(function(membershipData){
                vm.membershipData = membershipData;
                console.log('got data for ' + vm.displayYear, membershipData);

                if ( membershipData.length === 0 ){
                    vm.membershipData = {
                        type: 'Membership',
                        year: vm.displayYear,
                        data: {}
                    };
                }

                return vm.membershipData;
            });

        return vm.loadingPromise;
    }

    function loadMembershipDataForDisplayYear(){
        return membershipService.loadDataForYear(vm.displayYear);
    }

    function saveMembershipData(){
        return membershipService.save(vm.membershipData);
    }

    function ishareTotal(){
        var sum = 0;
        membershipDataItems().forEach(function(item){
            sum += item.ishare || 0;
        });
        return sum;
    }

    function membershipTotal(){
        var sum = 0;
        membershipDataItems().forEach(function(item){
            sum += item.membership || 0;
        });
        return sum;
    }

    function grandTotal(){
        var sum = 0;
        membershipDataItems().forEach(function(item){
            sum += item.ishare || 0;
            sum += item.membership || 0;
        });
        return sum;
    }

    function membershipDataItems(){
        return Object.keys(vm.membershipData.data).map(function(libraryId){
            return vm.membershipData.data[libraryId];
        });
    }
}

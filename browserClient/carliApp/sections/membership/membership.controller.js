angular.module('carli.sections.membership')
.controller('membershipController', membershipController);

function membershipController( $location, $q, $routeParams, alertService, errorHandler, libraryService, membershipService ){
    var vm = this;

    vm.currentYear = currentYear();
    vm.libraries = [];
    vm.loadingPromise = null;
    vm.displayYear = null;
    vm.membershipData = null;
    vm.nextYear = null;
    vm.previousYear = null;

    vm.saveMembershipData = saveMembershipData;
    vm.ishareTotal = ishareTotal;
    vm.membershipTotal = membershipTotal;
    vm.grandTotal = grandTotal;
    vm.viewNextYear = viewNextYear;
    vm.viewPreviousYear = viewPreviousYear;

    activate();

    function activate(){
        initVmYearsFromArgument();

        if ( vm.displayYear ){
            initializeMembershipData();
        }
        else {
            routeToYear(vm.currentYear);
        }
    }

    function initVmYearsFromArgument(){
        vm.displayYear = parseInt( $routeParams.year );
        vm.nextYear = vm.displayYear + 1;
        vm.previousYear = vm.displayYear - 1;
    }

    function routeToYear(year){
        $location.path('/membership/' + year);
    }

    function initializeMembershipData(){
        vm.loadingPromise = libraryService.listActiveLibraries()
            .then(function(libraryList){
                vm.libraries = libraryList;
                return vm.libraries;
            })
            .then(loadMembershipDataForDisplayYear)
            .then(function(membershipData){
                console.log('got data for ' + vm.displayYear, membershipData);

                if ( membershipData.length === 0 ){
                    vm.membershipData = {
                        type: 'Membership',
                        year: vm.displayYear,
                        data: {}
                    };
                }
                else {
                    vm.membershipData = membershipData[0];
                }

                return vm.membershipData;
            });

        return vm.loadingPromise;
    }

    function loadMembershipDataForDisplayYear(){
        return membershipService.loadDataForYear(vm.displayYear);
    }

    function saveMembershipData(){
        var savePromise = $q.when(true);

        if ( vm.membershipData.id ){
            savePromise = membershipService.update(vm.membershipData);
        }
        else {
            savePromise = membershipService.create(vm.membershipData);
        }

        return savePromise
            .then(workaroundCouchSmell)
            .then(saveSuccess)
            .catch(errorHandler);

        function workaroundCouchSmell(documentId){
            return membershipService.load(documentId)
                .then(function(updatedDoc){
                    vm.membershipData.id = documentId;
                    vm.membershipData._rev = updatedDoc._rev;
                });
        }

        function saveSuccess(){
            alertService.putAlert('Membership data saved', {severity: 'success'});
        }
    }

    function ishareTotal(){
        var sum = 0;

        if (!vm.membershipData){
            return 0;
        }

        membershipDataItems().forEach(function(item){
            sum += item.ishare || 0;
        });
        return sum;
    }

    function membershipTotal(){
        var sum = 0;

        if (!vm.membershipData){
            return 0;
        }

        membershipDataItems().forEach(function(item){
            sum += item.membership || 0;
        });
        return sum;
    }

    function grandTotal(){
        var sum = 0;

        if (!vm.membershipData){
            return 0;
        }

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

    function currentYear(){
        return parseInt( new Date().getFullYear() );
    }

    function viewNextYear(){
        routeToYear(vm.nextYear);
    }

    function viewPreviousYear(){
        routeToYear(vm.previousYear);
    }
}

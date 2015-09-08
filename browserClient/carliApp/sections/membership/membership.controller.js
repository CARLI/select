angular.module('carli.sections.membership')
.controller('membershipController', membershipController);

function membershipController( $location, $q, $routeParams, alertService, cycleService, errorHandler, libraryService, membershipService, notificationModalService ){
    var vm = this;

    vm.libraries = [];
    vm.loadingPromise = null;
    vm.displayYear = null;
    vm.membershipData = null;
    vm.nextYear = null;
    vm.previousYear = null;

    vm.createMembershipInvoices = createMembershipInvoices;
    vm.ishareTotal = ishareTotal;
    vm.grandTotal = grandTotal;
    vm.membershipTotal = membershipTotal;
    vm.saveMembershipData = saveMembershipData;
    vm.viewNextYear = viewNextYear;
    vm.viewPreviousYear = viewPreviousYear;

    activate();

    function activate(){
        initVmYearsFromArgument();

        if ( vm.displayYear ){
            initializeMembershipData();
        }
        else {
            routeToYear( currentFiscalYear() );
        }
    }

    function initVmYearsFromArgument(){
        vm.currentYear = currentFiscalYear();
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
                if ( membershipData ){
                    vm.membershipData = membershipData;
                }
                else {
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

    function currentCalendarYear(){
        return parseInt( new Date().getFullYear() );
    }

    function currentFiscalYear(){
        if ( cycleService.fiscalYearHasStartedForDate(new Date()) ){
            return currentCalendarYear();
        }
        else {
            return currentCalendarYear() - 1;
        }
    }

    function viewNextYear(){
        routeToYear(vm.nextYear);
    }

    function viewPreviousYear(){
        routeToYear(vm.previousYear);
    }

    function createMembershipInvoices(){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-membership-invoices',
            fiscalYear: vm.currentYear
        });
    }
}

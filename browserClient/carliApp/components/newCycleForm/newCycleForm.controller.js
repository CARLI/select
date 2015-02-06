angular.module('carli.newCycleForm')
    .controller('newCycleFormController', newCycleFormController);

function newCycleFormController( $scope, $rootScope, $location, alertService, cycleService ) {
    var vm = this;

    vm.cycle = null;
    vm.sourceCycle = null;
    vm.cycleTypeOptions = ['Calendar Year','Fiscal Year','Alternative Cycle'];
    vm.updateCopyFromOptions = updateCopyFromOptions;
    vm.populateFormForSourceCycle = populateFormForSourceCycle;
    vm.resetSourceCycle = resetSourceCycle;
    vm.saveCycle = saveCycle;
    vm.cancelEdit = cancelEdit;
    vm.closeModal = function() {
        $('#new-cycle-modal').modal('hide');
    };

    activate();
    function activate() {
        initializeEmptyCycle();
    }
    function initializeEmptyCycle() {
        resetSourceCycle();
        vm.cycle = cycleService.cycleDefaults();
        setFormPristine();
    }
    function saveCycle() {
        var creationPromise;
        if (vm.sourceCycle) {
            creationPromise = cycleService.createCycleFrom(vm.sourceCycle, vm.cycle);
        } else {
            creationPromise = cycleService.create(vm.cycle);
        }
        creationPromise.then(function (cycleId) {
                vm.closeModal();
                initializeEmptyCycle();
                $('#new-cycle-modal').on('hidden.bs.modal', function (e) {
                    $scope.$apply(function() {
                        $location.url('/subscription/' + cycleId);
                    });
                });
                alertService.putAlert('Cycle added', {severity: 'success'});
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }
    function cancelEdit() {
        initializeEmptyCycle();
    }

    function updateCopyFromOptions(){
        cycleService.listActiveCyclesOfType(vm.cycle.cycleType)
            .then(function(matchingCycles){
                vm.matchingCyclesOfType = matchingCycles;
            });
    }

    function resetSourceCycle() {
        vm.sourceCycle = null;
    }

    function populateFormForSourceCycle() {
        vm.cycle.year = vm.sourceCycle.year + 1;
    }

    function setFormPristine(){
        if ( $rootScope.forms && $rootScope.forms.newCycleForm ){
            $rootScope.forms.newCycleForm.$setPristine();
        }
    }
}

angular.module('carli.newCycleForm')
    .controller('newCycleFormController', newCycleFormController);

function newCycleFormController( $scope, $rootScope, $location, alertService, cycleService ) {
    var vm = this;

    vm.cycle = null;
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
        vm.cycle = cycleService.cycleDefaults();
        setFormPristine();
    }
    function saveCycle() {
        cycleService.create(vm.cycle)
            .then(function (cycleId) {
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

    function setFormPristine(){
        console.log('set pristine: ', $rootScope.forms ? $rootScope.forms.newCycleForm : $rootScope.forms);
        if ( $rootScope.forms && $rootScope.forms.newCycleForm ){
            $rootScope.forms.newCycleForm.$setPristine();
        }
    }
}

angular.module('carli.newCycleForm')
    .controller('newCycleFormController', newCycleFormController);

function newCycleFormController( $scope, $location, alertService, cycleService ) {
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
    }
    function saveCycle() {
        cycleService.create(vm.cycle)
            .then(function (cycleId) {
                vm.closeModal();
                $('#new-cycle-modal').on('hidden.bs.modal', function (e) {
                    $scope.$apply(function() {
                        $location.url('/subscription/' + cycleId);
                    });
                });
                initializeEmptyCycle();
                alertService.putAlert('Cycle added', {severity: 'success'});
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }
    function cancelEdit() {
        initializeEmptyCycle();
        if ( $scope.newCycleForm ){
            $scope.newCycleForm.$setPristine();
        }
    }
}

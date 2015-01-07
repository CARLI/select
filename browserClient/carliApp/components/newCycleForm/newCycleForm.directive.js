angular.module('carli.newCycleForm')
    .directive('newCycleForm', newCycleForm);

function newCycleForm() {
    return {
        restrict: 'E',
        scope: { afterSubmitFn: '=' },
        controller: 'newCycleFormController',
        controllerAs: 'vm',
        templateUrl: 'carliApp/components/newCycleForm/newCycleForm.html'
    };
}


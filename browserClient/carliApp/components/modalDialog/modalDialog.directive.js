angular.module('carli.modalDialog')
    .directive('modalDialog', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/modalDialog/modalDialog.html',
            scope: {
                title: '=',
                submitFn: '&',
                modalId: '=',
                modalClass: '@'
            },
            transclude: true,
            controller: modalDialogController
        };
    });

function modalDialogController($scope) {
    $scope.closeDialog = function() {
        $('#' + $scope.modalId).modal('hide');
    };
}

angular.module('carli.modalDialog')
    .directive('modalDialog', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/modalDialog/modalDialog.html',
            scope: {
                title: '=',
                submitFn: '&',
                modalId: '=',
                modalSize: '@'
            },
            transclude: true,
            controller: modalDialogController
        };
    });

function modalDialogController($scope) {
    $scope.modalClass = getModalClass($scope.modalSize);

    $scope.closeDialog = function() {
        $('#' + $scope.id).modal('hide');
    };

    function getModalClass(size) {
        var modalClass;
        switch (size) {
            case 'large':
                modalClass = 'modal-lg';
                break;
            case 'small':
                modalClass = 'modal-sm';
                break;
            case 'medium':
                modalClass = '';
                break;
            default:
                modalClass = '';
        }
        return modalClass;
    }
}

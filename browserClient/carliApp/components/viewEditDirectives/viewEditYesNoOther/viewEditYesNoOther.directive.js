angular.module('carli.viewEditDirectives.viewEditYesNoOther')
    .directive('viewEditYesNoOther', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditYesNoOther/viewEditYesNoOther.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true,
            link: linkYesNoOther
        };
    });

function linkYesNoOther($scope, iElement, iAttrs){
    var scope = $scope;
    scope.items = ['Yes','No','Other'];

    scope.$watch('ngModel', function(newValue, oldValue) {
        if (newValue !== undefined) {
            if (newValue === 'Yes' || newValue === 'No') {
                scope.selectedValue = scope.ngModel;
            }
            else {
                scope.selectedValue = 'Other';
            }
        }
    });

    $scope.$on('goodSelectChange', function(event, value) {
        scope.ngModel = scope.items[value];
    });
}
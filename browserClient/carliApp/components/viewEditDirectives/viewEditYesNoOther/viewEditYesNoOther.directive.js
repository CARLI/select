angular.module('carli.viewEditDirectives.viewEditYesNoOther')
    .directive('viewEditYesNoOther', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditYesNoOther/viewEditYesNoOther.html',
            scope: {
                ngModel: '=',
                editMode: '='
            },
            transclude: true,
            link: linkYesNoOther
        };
    });

function linkYesNoOther($scope, iElement, iAttrs){
    var scope = $scope;
    var select = iElement.find('select');

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

    select.on('change', function(e){
        scope.$apply(function(){
            scope.ngModel = select.val();
        });
    });
}
angular.module('carli.viewEditDirectives.viewEditYesNoOther')
    .directive('viewEditYesNoOther', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditYesNoOther/viewEditYesNoOther.html',
            scope: {
                ngModel: '=',
                editMode: '='
            },
            transclude: true
        };
    });

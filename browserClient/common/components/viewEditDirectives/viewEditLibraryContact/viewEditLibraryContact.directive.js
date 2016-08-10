angular.module('common.viewEditDirectives.viewEditLibraryContact')
    .directive('viewEditLibraryContact', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditLibraryContact/viewEditLibraryContact.html',
            scope: {
                contact: '=',
                editMode: '=',
                inputId: '@'
            }
        };
    });

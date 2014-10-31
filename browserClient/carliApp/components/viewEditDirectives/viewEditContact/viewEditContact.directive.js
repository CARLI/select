angular.module('carli.viewEditDirectives.viewEditContact')
    .directive('viewEditContact', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditContact/viewEditContact.html',
            scope: { contact: '=', editMode: '=' }
        };
    });

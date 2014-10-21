angular.module('carli.contactEditor')
    .directive('contactEditor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/contactEditor/contactEditor.html',
            scope: { contact: '=' }
        };
    });

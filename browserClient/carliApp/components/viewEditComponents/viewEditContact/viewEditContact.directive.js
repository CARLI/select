angular.module('carli.viewEditContact')
    .directive('viewEditContact', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditComponents/viewEditContact/viewEditContact.html',
            scope: { contact: '=' }
        };
    });

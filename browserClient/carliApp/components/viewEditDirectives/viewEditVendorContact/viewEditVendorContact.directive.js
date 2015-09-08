angular.module('carli.viewEditDirectives.viewEditVendorContact')
    .directive('viewEditVendorContact', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditVendorContact/viewEditVendorContact.html',
            scope: {
                contact: '=',
                editMode: '=',
                inputId: '@'
            }
        };
    });

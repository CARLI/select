angular.module('carli.editOffering')
    .directive('editOffering', function (editOfferingService) {
        return {
            restrict: 'E',
            scope: {
                cycle: '=',
                offering: '='
            },
            link: editOfferingPostLink,
            templateUrl: '/carliApp/components/editOffering/editOffering.html'
        };

        function editOfferingPostLink(scope, element, attrs) {

        }
    });

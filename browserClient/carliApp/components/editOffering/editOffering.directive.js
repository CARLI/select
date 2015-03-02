angular.module('carli.editOffering')
    .directive('editOffering', function (editOfferingService) {
        return {
            restrict: 'E',
            scope: {
                cycle: '='
            },
            controller: editOfferingController,
            controllerAs: 'vm',
            bindToController: true,
            link: editOfferingPostLink,
            templateUrl: '/carliApp/components/editOffering/editOffering.html'
        };

        function editOfferingController() {

        }
        function editOfferingPostLink(scope, element, attrs) {
            scope.$watch(getCurrentOffering, watchCurrentOffering);

            function getCurrentOffering() {
                return editOfferingService.getCurrentOffering();
            }

            function watchCurrentOffering(newOffering, oldOffering) {
                console.log(newOffering);
            }
        }
    });
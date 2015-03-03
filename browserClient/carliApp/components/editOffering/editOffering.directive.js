angular.module('carli.editOffering')
    .directive('editOffering', function (editOfferingService) {
        return {
            restrict: 'E',
            scope: {
                cycle: '=',
                offering: '=',
                columns: '='
            },
            link: editOfferingPostLink,
            controller: editOfferingController,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/carliApp/components/editOffering/editOffering.html'
        };

        function editOfferingPostLink(scope, element, attrs) {

        }

        function editOfferingController() {
            var vm = this;
            vm.saveOffering = saveOffering;
            vm.shouldShowColumn = shouldShowColumn;

            function saveOffering() {
                console.log('not saving it');
            }

            function shouldShowColumn(columnName) {
                return vm.columns.indexOf(columnName) !== -1;
            }
        }
    });

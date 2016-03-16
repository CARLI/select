angular.module('carli.editOffering')
    .directive('editOffering', function () {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/editOffering/editOffering.html',
            scope: {
                cycle: '=',
                offering: '=',
                columns: '=',
                notifyParentOfSave: '=onOfferingSaved'
            },
            controller: 'editOfferingController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

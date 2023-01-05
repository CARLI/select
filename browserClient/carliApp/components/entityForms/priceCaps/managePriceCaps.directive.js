angular.module('carli.entityForms.priceCaps')
    .directive('managePriceCaps', managePriceCaps);

function managePriceCaps() {
    return {
        restrict: 'E',
        scope: {
            afterSubmitFn: '=' ,
            entity: '=',
            year: '@',
        },
        controller: 'managePriceCapsController',
        controllerAs: 'vm',
        bindToController: true,
        templateUrl: '/carliApp/components/entityForms/priceCaps/managePriceCaps.html'
    };
}



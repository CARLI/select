angular.module('carli.entityList')
.directive('entityList', function() {
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/entityList/entityList.html',
        scope: {
            values: '=',
            columns: '=',
            entityLabel: '@',
            orderBy: '='
        },
        controller: 'entityListController',
        controllerAs: 'vm'
    };
});

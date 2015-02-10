angular.module('carli.entityList')
.directive('entityList', function() {
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/entityList/entityList.html',
        scope: {
            values: '=',
            columns: '=',
            entityLabel: '@',
            orderBy: '=',
            loadingPromise: '='
        },
        controller: 'entityListController',
        controllerAs: 'vm'
    };
});

angular.module('carli.activityLogList')
.directive('activityLogList', function(){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/activityLogList/activityLogList.html',
        scope: {},
        controller: activityLogListController,
        controllerAs: 'vm',
        bindToController: true
    };
});
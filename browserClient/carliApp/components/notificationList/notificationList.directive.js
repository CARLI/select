angular.module('carli.notificationList')
.directive('notificationList', function(){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/notificationList/notificationList.html',
        scope: {
            notifications: '='
        },
        controller: notificationListController,
        controllerAs: 'vm',
        bindToController: true
    };
});
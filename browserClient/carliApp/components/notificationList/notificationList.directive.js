angular.module('carli.notificationList')
.directive('notificationList', function( uuid ){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/notificationList/notificationList.html',
        scope: {
            mode: '@',
            title: '@',
            subTitle: '@'
        },
        controller: notificationListController,
        controllerAs: 'vm',
        bindToController: true,
        link: function notificationListPostLink(scope, element, attrs){
            scope.listId = uuid.generateCssId();
        }
    };
});
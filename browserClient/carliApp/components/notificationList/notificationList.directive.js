angular.module('carli.notificationList')
.directive('notificationList', function( uuid ){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/notificationList/notificationList.html',
        scope: {
            mode: '@',
            listTitle: '@',
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
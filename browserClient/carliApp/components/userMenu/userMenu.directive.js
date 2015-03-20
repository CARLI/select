angular.module('carli.userMenu')
.directive('userMenu', function(){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/userMenu/userMenu.html',
        scope: {},
        controller: userMenuController,
        controllerAs: 'vm',
        bindToController: true
    };
});
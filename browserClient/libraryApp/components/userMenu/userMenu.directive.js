angular.module('library.userMenu')
.directive('userMenu', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/userMenu/userMenu.html',
        scope: {},
        controller: userMenuController,
        controllerAs: 'vm',
        bindToController: true
    };
});
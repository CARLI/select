angular.module('library.navBar')
.directive('navBar', function() {
    return {
        restrict: 'A',
        templateUrl: '/libraryApp/components/navBar/navBar.html',
        scope: {},
        controller: 'navBarController',
        controllerAs: 'vm',
        bindToController: true
    };
});

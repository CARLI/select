angular.module('vendor.userMenu')
.directive('userMenu', function(){
    return {
        restrict: 'E',
        templateUrl: '/vendorApp/components/userMenu/userMenu.html',
        scope: {},
        controller: userMenuController,
        controllerAs: 'vm',
        bindToController: true
    };
});
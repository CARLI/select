angular.module('carli.subscriptionScreenComponents.libraryInfo')
.directive('libraryInfo', function(){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/subscriptionScreenComponents/libraryInfo/libraryInfo.html',
        scope: {
            library: '='
        },
        controller: libraryInfoController,
        controllerAs: 'vm',
        bindToController: true
    };
});
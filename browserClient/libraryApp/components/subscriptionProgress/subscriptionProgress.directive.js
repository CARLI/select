angular.module('library.subscriptionProgress')
.directive('subscriptionProgress', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/subscriptionProgress/subscriptionProgress.html',
        scope: {
            step: '='
        }
    };
});
angular.module('library.subscriptionButton')
.directive('subscriptionButton', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/subscriptionButton/subscriptionButton.html',
        scope: {
            title: '@',
            price: '@',
            selected: '='
        }
    };
});
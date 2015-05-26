angular.module('library.askCarliForm')
.directive('askCarliForm', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/askCarliForm/askCarliForm.html',
        scope: {},
        controller: 'askCarliFormController',
        controllerAs: 'vm',
        bindToController: true
    };
});
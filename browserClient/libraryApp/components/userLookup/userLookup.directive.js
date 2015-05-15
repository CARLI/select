angular.module('library.userLookup')
    .directive('userLookup', function(){
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/libraryApp/components/userLookup/userLookup.html',
            controller: 'userLookupController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

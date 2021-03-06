angular.module('library.subscriptionSelections')
    .directive('subscriptionSelections', function(){
        return {
            restrict: 'E',
            templateUrl: 'libraryApp/components/subscriptionSelections/subscriptionSelections.html',
            scope: {
                cycle: '='
            },
            controller: 'subscriptionSelectionsController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

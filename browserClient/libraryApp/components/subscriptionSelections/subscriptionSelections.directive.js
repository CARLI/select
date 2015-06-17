angular.module('library.subscriptionSelections')
    .directive('subscriptionSelections', function(){
        return {
            restrict: 'E',
            templateUrl: 'libraryApp/components/subscriptionSelections/subscriptionSelections.html',
            scope: {
                cycle: '=',
                libraryStatus: '='
            },
            controller: 'subscriptionSelectionsController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

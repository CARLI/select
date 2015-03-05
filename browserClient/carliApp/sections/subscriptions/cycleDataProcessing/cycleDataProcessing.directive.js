angular.module('carli.sections.subscriptions.cycleDataProcessing')
    .directive('cycleDataProcessing', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/cycleDataProcessing/cycleDataProcessing.html',
            scope: {
                cycleRouter: '='
            },
            controller: 'cycleDataProcessingController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

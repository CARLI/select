angular.module('library.cycleChooser')
    .directive('cycleChooser', function() {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/libraryApp/components/cycleChooser/cycleChooser.html',
            controller: 'cycleChooserController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

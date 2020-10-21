angular.module('carli.sections.cycleCreationDashboard.cycleCreationJobInfo')
    .directive('cycleCreationJobInfo', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/cycleCreationDashboard/cycleCreationJobInfo/cycleCreationJobInfo.html',
            scope: {
                job: '=',
                resumeAction: '&'
            },
            controller: 'cycleCreationJobInfoController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

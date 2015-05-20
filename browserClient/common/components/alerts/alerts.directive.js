angular.module('common.alerts')
    .directive('alerts', function (alertService) {
        return {
            restrict: 'E',
            template: ['<div ng-repeat="alert in alerts" class="alert alert-{{ alert.severity }}">',
                           '<button type="button" ng-click="clearAlert(alert)" class="close" data-dismiss="alert">',
                               '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>',
                           '</button>',
                           '{{ alert.message }}',
                       '</div>'].join(''),
            link: alertLink
        };

        function alertLink (scope) {
            scope.clearAlert = alertService.clearAlert;
            scope.$watch( alertService.getAlerts, function(newAlerts, oldAlerts){
                scope.alerts = newAlerts;
            });
        }
    });
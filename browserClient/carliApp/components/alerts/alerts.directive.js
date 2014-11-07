angular.module('carli.alerts')
    .directive('alerts', function (alertService) {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/alerts/alerts.html',
            link: alertLink
        };

        function alertLink (scope) {
            scope.clearAlert = alertService.clearAlert;
            scope.$watch( alertService.getAlerts, function(newAlerts, oldAlerts){
                scope.alerts = newAlerts;
            });
        }
    });
angular.module('carli.notificationModal')
    .directive('notificationModal', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/notificationModal/notificationModal.html',
            scope: {},
            controller: 'notificationModalController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

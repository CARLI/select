angular.module('carli.notificationPreviewModal')
    .directive('notificationPreviewModal', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/notificationPreviewModal/notificationPreviewModal.html',
            scope: {
            },
            controller: 'notificationPreviewModalController',
            controllerAs: 'vm',
            bindToController: true
        };
    });

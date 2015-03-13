angular.module('carli.notificationModal')
    .directive('notificationModal', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/notificationModal/notificationModal.html',
            scope: {},
            controller: notificationModalController,
            controllerAs: 'vm',
            bindToController: true
        };

        function notificationModalController($scope, notificationModalService) {
            var vm = this;

            $scope.$watch(notificationModalService.receiveStartDraftMessage, receiveStartDraftMessage);

            function receiveStartDraftMessage(message) {
                if (message) {
                    console.log('it happened');
                    $('#notification-modal').modal();
                }
            }
        }
    });

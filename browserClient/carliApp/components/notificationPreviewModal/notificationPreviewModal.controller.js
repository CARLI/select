angular.module('carli.notificationPreviewModal')
.controller('notificationPreviewModalController', notificationPreviewModalController);

function notificationPreviewModalController($scope, notificationPreviewModalService) {
    var vm = this;

    activate();

    function activate(){
        $scope.$watch(notificationPreviewModalService.receiveShowPreviewMessage, receiveShowPreviewMessage);
    }

    function receiveShowPreviewMessage(message) {
        if (!message) {
            return;
        }

        vm.notification = message;
        showModal();

        function showModal() {
            $('#notification-preview-modal').modal();
        }
    }
}
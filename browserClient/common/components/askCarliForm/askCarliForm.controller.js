angular.module('common.askCarliForm')
.controller('askCarliFormController', askCarliFormController);

function askCarliFormController($location, $scope, askCarliService, userService) {
    var vm = this;

    vm.draft = {};

    vm.sendMessage = sendMessage;

    activate();

    function activate(){
        resetForm();
        listenForAskCarliButtonEvents();
        clearFormOnAnyBootstrapCancel();
    }

    function listenForAskCarliButtonEvents(){
        $scope.$watch(askCarliService.receiveStartDraftMessage, receiveStartDraftMessage);

        function receiveStartDraftMessage(askCarliMessage){
            if (!askCarliMessage) {
                return;
            } else {
                askCarliService.acknowledgeStartDraftMessage();
            }

            resetForm();

            vm.draft.context = askCarliMessage;

            showDraftMessageModal();
        }
    }

    function clearFormOnAnyBootstrapCancel(){
        $('#ask-carli-form-modal').on('hide.bs.modal', modalClosing);

        function modalClosing(){
            $scope.$applyAsync(resetForm);
        }
    }

    function resetForm(){
        vm.draft = {};
    }

    function showDraftMessageModal() {
        $('#ask-carli-form-modal').modal();
    }

    function hideDraftMessageModal() {
        $('#ask-carli-form-modal').modal('hide');
    }

    function showMessageSentModal(){
        $('#ask-carli-form-sent-modal').modal();
    }

    function sendMessage(){
        var page = $location.absUrl();
        var user = userService.getUser();

        var message = {
            message: vm.draft,
            page: page,
            user: user
        };

        return askCarliService.sendAskCarliMessage(message)
            .then(messageSentSuccess);

        function messageSentSuccess(){
            hideDraftMessageModal();
            showMessageSentModal();
            resetForm();
        }
    }
}

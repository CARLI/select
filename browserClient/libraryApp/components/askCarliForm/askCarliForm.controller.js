angular.module('library.askCarliForm')
.controller('askCarliFormController', askCarliFormController);

function askCarliFormController($location, $q, $scope, userService) {
    var vm = this;

    vm.draft = {};

    vm.sendMessage = sendMessage;

    activate();

    function activate(){
        $('#ask-carli-form-modal').on('hide.bs.modal', modalClosing);

        resetForm();
    }

    function modalClosing(){
        resetForm();
        $scope.$digest();
    }

    function resetForm(){
        vm.draft = {};
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

        console.log('send message', message);

        $q.when()
            .then(messageSentSuccess);

        function messageSentSuccess(){
            hideDraftMessageModal();
            showMessageSentModal();
            resetForm();
        }
    }
}

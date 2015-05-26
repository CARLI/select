angular.module('library.askCarliForm')
.controller('askCarliFormController', askCarliFormController);

function askCarliFormController($q, $location, userService) {
    var vm = this;

    vm.draft = {};

    vm.cancel = cancel;
    vm.sendMessage = sendMessage;

    activate();

    function activate(){
        resetForm();
    }

    function resetForm(){
        vm.draft = {};
    }

    function hideDraftMessageModal() {
        $('#ask-carli-form-modal').modal('hide');
    }


    function cancel(){
        resetForm();
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
            resetForm();
        }
    }
}

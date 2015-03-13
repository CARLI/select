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

        function notificationModalController($scope, notificationService, notificationModalService, notificationTemplateService) {
            var vm = this;
            vm.saveNotifications = saveNotifications;

            $scope.$watch(notificationModalService.receiveStartDraftMessage, receiveStartDraftMessage);

            function receiveStartDraftMessage(message) {
                if (!message) {
                    return;
                }

                vm.draft = {};

                notificationTemplateService.load(message.templateId)
                    .then(addTemplateToVm)
                    .then(populateFormWithDefaultsForTemplate)
                    .then(populateFormWithRecipientsForTemplateType)
                    .then(showModal)
                    .catch(function (err) {
                        console.log(err);
                    });

                function addTemplateToVm(template) {
                    vm.template = template;
                    return template;
                }

                function populateFormWithDefaultsForTemplate(template) {
                    vm.draft.subject = template.subject;
                    vm.draft.emailBody = template.emailBody;
                    if (template.hasOwnProperty('pdfBody')) {
                        vm.draft.pdfBody = template.pdfBody;
                    }
                    return template;
                }

                function populateFormWithRecipientsForTemplateType(template) {
                    vm.draft.recipients = '(recipient list)';
                    return template;
                }

                function showModal() {
                    $('#notification-modal').modal();
                }
            }

            function saveNotifications(){
                console.log('create notifications for ',vm.draft);
                notificationService.createNotificationsFor( vm.draft )
                    .then(alertSuccess, alertError)
                    .then(closeModal);

                function alertSuccess() {
                    alert('it worked');
                }
                function alertError(err) {
                    alert(err);
                }
                function closeModal() {
                    $('#notification-modal').modal('hide');
                }
            }
        }
    });

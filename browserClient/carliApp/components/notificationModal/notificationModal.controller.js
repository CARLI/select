angular.module('carli.notificationModal')
.controller('notificationModalController', notificationModalController);

function notificationModalController($scope, $rootScope, alertService, cycleService, libraryService, notificationService, notificationModalService, notificationTemplateService, offeringService, productService, vendorService) {
    var vm = this;
    vm.draft = {};
    vm.template = null;

    vm.saveNotifications = saveNotifications;
    vm.useTemplate = useTemplate;

    activate();

    function activate(){
        $scope.$watch(notificationModalService.receiveStartDraftMessage, receiveStartDraftMessage);
        setupModalClosingUnsavedChangesWarning();
    }

    function keepCustomTemplates(template) {
        return template.type === 'other';
    }

    function useTemplate(){
        initializeDraftFromTemplate( vm.template );
    }

    function initializeDraftFromTemplate( template ){
        vm.template = template;

        vm.draft = {
            recipients: [],
            subject: template.subject,
            emailBody: template.emailBody,
            pdfBody: '',
            isPdfContentEditable: template.isPdfContentEditable,
            draftStatus: 'draft',
            notificationType: template.notificationType
        };

        if (template.hasOwnProperty('pdfBody')) {
            vm.draft.pdfBody = template.pdfBody;
        }

        return vm.draft;
    }

    /*
     * Possible properties for message spec object:
     *
         {
            templateId: '',
            cycleId: '',
            recipientId: '',
            offeringIds: []
         }
     */
    function receiveStartDraftMessage(message) {
        if (!message) {
            return;
        }

        notificationTemplateService.load(message.templateId)
            .then(initializeDraftFromTemplate)
            .then(populateRecipientList)
            .then(prepareDraftDataForEditForm)
            .then(showModal)
            .catch(function (err) {
                console.log(err);
            });

        function populateRecipientList(draftNotification) {
            var template = vm.template;
            var cycleId = message.cycleId;

            if (isAnnualAccessFeeInvoice()) {
                return populateForAnnualAccessFeeInvoice();
            } else if (isContactNonPlayers()) {
                return populateForContactNonPlayers();
            } else if (shouldSendEverythingToEveryone()) {
                return populateForAllEntities();
            } else if (doRecipientsComeFromOfferings()) {
                return populateForRecipientsFromOfferings();
            } else {
                return populateForSingleRecipient();
            }

            function isAnnualAccessFeeInvoice(){
                return message.templateId === 'notification-template-annual-access-fee-invoices';
            }

            function isContactNonPlayers(){
                return message.templateId === 'notification-template-contact-non-players' ||
                       message.templateId === 'notification-template-library-reminder';
            }

            function shouldSendEverythingToEveryone() {
                return doRecipientsComeFromOfferings() && isNotificationAboutAllOfferings();
            }
            function isNotificationAboutAllOfferings() {
                return !message.offeringIds;
            }

            function doRecipientsComeFromOfferings() {
                return !message.recipientId;
            }

            function populateForAnnualAccessFeeInvoice(){
                //TODO
            }

            function populateForContactNonPlayers(){
                return cycleService.load(cycleId)
                    .then(libraryService.listLibrariesWithSelectionsInCycle)
                    .then(listLibrariesThatHaveNotMadeSelections)
                    .then(function( listOfLibrariesToContact ){
                        listOfLibrariesToContact.map(addEntityToRecipientList);
                        return draftNotification;
                    });

                    function listLibrariesThatHaveNotMadeSelections( librariesThatHaveMadeSelections ){
                        return libraryService.list().then(function(listOfAllLibraries){
                            return listOfAllLibraries.filter(function(library){
                                return hasNotMadeSelection(library);
                            });
                        });

                        function hasNotMadeSelection( lib ){
                            var index = librariesThatHaveMadeSelections.indexOf( lib.id.toString() );

                            if ( index > -1 ){
                                librariesThatHaveMadeSelections.splice(index,1);
                                return false;
                            }
                            return true;
                        }
                    }
            }

            function populateForAllEntities(){
                if (notificationService.notificationTypeIsForLibrary(template.notificationType)) {
                    return libraryService.list().then(function(libraryList){
                        libraryList.map(addEntityToRecipientList);
                        return draftNotification;
                    });
                } else if (notificationService.notificationTypeIsForVendor(template.notificationType)) {
                    return productService.listProductCountsByVendorId()
                        .then(function(productsByVendorId){ return Object.keys(productsByVendorId); })
                        .then(vendorService.getVendorsById)
                        .then(function(vendorList) {
                            vendorList.map(addEntityToRecipientList);
                            return draftNotification;
                        });
                } else {
                    return draftNotification;
                }
            }

            function populateForRecipientsFromOfferings() {
                return offeringService.getOfferingsById(message.offeringIds)
                    .then(loadEntitiesForOfferings)
                    .then(addEntitiesToRecipientList);

                function loadEntitiesForOfferings(offerings) {
                    var entityPromise;

                    if (notificationService.notificationTypeIsForLibrary(vm.template.notificationType)) {
                        var libraryIds = offerings.map(getLibraryIdFromOffering).filter(discardDuplicateIds);
                        entityPromise = libraryService.getLibrariesById(libraryIds);
                    } else if (notificationService.notificationTypeIsForVendor(vm.template.notificationType)) {
                        var productIds = offerings.map(getProductIdFromOffering);
                        entityPromise = productService.getProductsById(productIds).then(function (products) {
                            var vendorIds = products.map(getVendorIdFromProduct).filter(discardDuplicateIds);
                            return vendorService.getVendorsById(vendorIds);
                        });
                    }

                    return entityPromise;
                }

                function getLibraryIdFromOffering(offering) {
                    var id = offering.library;
                    return typeof id === 'number' ? id : parseInt(id, 10);
                }
                function getProductIdFromOffering(offering) {
                    return offering.product;
                }
                function getVendorIdFromProduct(product) {
                    return product.vendor;
                }

                function discardDuplicateIds(value, index, self) {
                    return self.indexOf(value) === index;
                }

                function addEntitiesToRecipientList( entities ){
                    entities.forEach(addEntityToRecipientList);
                    return draftNotification;
                }
            }

            function populateForSingleRecipient() {
                if (notificationService.notificationTypeIsForLibrary(template.notificationType)) {
                    return libraryService.load(message.recipientId)
                        .then(addEntityToRecipientList);
                } else if (notificationService.notificationTypeIsForVendor(template.notificationType)) {
                    return vendorService.load(message.recipientId)
                        .then(addEntityToRecipientList);
                } else {
                    draftNotification.recipients.push({
                        value: message.recipientId,
                        label: message.recipientId
                    });
                    return draftNotification;
                }
            }

            function addEntityToRecipientList( entity ){
                draftNotification.recipients.push({
                    value: entity.id,
                    label: notificationService.getRecipientLabel(entity.name, vm.template.notificationType)
                });
                return draftNotification;
            }
        }

        function prepareDraftDataForEditForm( draftNotification ){
            draftNotification.to = draftNotification.recipients.map(getLabel).join(', ');

            function getLabel( recipient ){
                return recipient.label;
            }

            console.log('Draft',draftNotification);
            return draftNotification;
        }

        function showModal() {
            $('#notification-modal').modal();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#notification-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetNotificationForm(){
        vm.draft = {};
        vm.template = null;
        setNotificationFormPristine();
    }

    function setNotificationFormPristine() {
        if ($scope.notificationForm) {
            $scope.notificationForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.notificationForm) {
            $rootScope.forms.notificationForm.$setPristine();
        }
    }

    function hideModal() {
        $('#notification-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( notificationFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetNotificationForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function notificationFormIsDirty(){
        if ($scope.notificationForm) {
            return $scope.notificationForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.notificationForm) {
            return $rootScope.forms.notificationForm.$dirty;
        }
        return false;
    }

    function saveNotifications(){
        notificationService.createNotificationsFor( vm.draft )
            .then(saveSuccess)
            .catch(saveError);

        function saveSuccess(){
            alertService.putAlert('Notifications created', {severity: 'success'});
            resetNotificationForm();
            hideModal();
            if ( typeof vm.afterSubmitFn === 'function' ){
                vm.afterSubmitFn();
            }
        }

        function saveError(error) {
            alertService.putAlert(error, {severity: 'danger'});
        }
    }
}

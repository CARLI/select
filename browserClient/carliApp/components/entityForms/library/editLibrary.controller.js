angular.module('carli.entityForms.library')
    .controller('editLibraryController', editLibraryController);

function editLibraryController( $scope, $rootScope, authService, activityLogService, alertService, cycleService, entityBaseService, errorHandler, libraryService ) {
    var vm = this;

    vm.crmContacts = [];
    vm.libraryId = $scope.libraryId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.masqueradeAs = masqueradeAs;
    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.saveLibrary = saveLibrary;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;
    vm.closeModal = function() {
        $('#new-library-modal').modal('hide');
    };

    vm.institutionYearsOptions = libraryService.getInstitutionYearsOptions();
    vm.institutionTypeOptions = libraryService.getInstitutionTypeOptions();
    vm.membershipLevelOptions = libraryService.getMembershipLevelOptions();

    vm.statusOptions = entityBaseService.getStatusOptions();

    activate();

    function activate() {
        if (vm.libraryId ){
            initializeForExistingLibrary();
        }
    }

    function initializeForExistingLibrary() {
        libraryService.load(vm.libraryId)
            .then(function (library) {
                vm.library = angular.copy(library);
                setLibraryFormPristine();
            })
            .then(loadCrmContactsForLibrary)
            .then(loadCyclesForActiveProductsDisplay);

        vm.editable = false;
        vm.newLibrary = false;
    }

    function loadCyclesForActiveProductsDisplay(){
        return vm.loadingPromise = cycleService.listNonArchivedClosedCyclesIncludingOneTimePurchase()
            .then(function(cycleList){
                vm.cycles = cycleList;
            });
    }

    function loadCrmContactsForLibrary(){
        return libraryService.listCrmContactsForLibrary(vm.libraryId)
            .then(function(contacts){
                vm.crmContacts = contacts;
            });
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit(){
        activate();
    }

    function resetLicenseForm() {
        activate();
    }

    function setLibraryFormPristine() {
        if ($scope.libraryForm) {
            $scope.libraryForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.libraryForm) {
            $rootScope.forms.libraryForm.$setPristine();
        }
    }

    function saveLibrary(){
        if (vm.libraryId !== undefined){
            libraryService.update( vm.library ).then(function(){
                alertService.putAlert('Library updated', {severity: 'success'});
                resetLicenseForm();
                afterSubmitCallback();
                return logUpdateActivity();
            })
            .catch(errorHandler);
        }
        else {
            libraryService.create( vm.library ).then(function(){
                alertService.putAlert('Library updated', {severity: 'success'});
                resetLicenseForm();
                afterSubmitCallback();
                return logAddActivity();
            })
            .catch(errorHandler);
        }
    }

    function addContact(contactType) {
        vm.library.contacts.push({
            contactType: contactType
        });
    }

    function deleteContact(contact) {
        var contactIndex = vm.library.contacts.indexOf(contact);
        if (contactIndex >= 0) {
            vm.library.contacts.splice(contactIndex, 1);
        }
    }

    function logUpdateActivity(){
        return activityLogService.logEntityModified(vm.library);
    }

    function logAddActivity(){
        return activityLogService.logEntityAdded(vm.library);
    }

    function masqueradeAs(libraryId) {
        authService.masqueradeAsLibrary(libraryId);
    }
}

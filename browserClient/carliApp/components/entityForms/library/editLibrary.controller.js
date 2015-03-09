angular.module('carli.entityForms.library')
    .controller('editLibraryController', editLibraryController);

function editLibraryController( $scope, $rootScope, entityBaseService, libraryService, alertService ) {
    var vm = this;

    vm.libraryId = $scope.libraryId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

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
        if (vm.libraryId === undefined) {
            initializeForNewLibrary();
        }
        else {
            initializeForExistingLibrary();
        }
        vm.isModal = vm.newLibrary;
    }
    function initializeForNewLibrary() {
        vm.library = {
            type: 'Library',
            isActive: true,
            contacts: [
                { contactType: 'Director' },
                { contactType: 'E-Resources Liaison' },
                { contactType: 'Other' },
                { contactType: 'Notification Only' }
            ]
        };
        vm.editable = true;
        vm.newLibrary = true;
        setLibraryFormPristine();
    }
 
    function initializeForExistingLibrary() {
        libraryService.load(vm.libraryId).then( function( library ) {
          vm.library = library;
        } );
        vm.editable = false;
        vm.newLibrary = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit(){
        vm.editable = false;
        activate();
        setLibraryFormPristine();
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
                setLibraryFormPristine();
                toggleEditable();
                afterSubmitCallback();
            })
            .catch(function(error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
        }
        else {
            libraryService.create( vm.library ).then(function(){
                alertService.putAlert('Library created', {severity: 'success'});
                afterSubmitCallback();
                initializeForNewLibrary();
            })
            .catch(function(error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
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


}

angular.module('carli.entityForms.library')
    .controller('editLibraryController', editLibraryController);

function editLibraryController( $scope, libraryService, alertService ) {
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

    vm.statusOptions = [
        {
            label: 'Active',
            value: true
        },
        {
            label: 'Inactive',
            value: false
        }
    ];

    activate();

    function activate() {
        if (vm.libraryId === undefined) {
            initializeForNewLibrary();
        }
        else {
            initializeForExistingLibrary();
        }
        vm.isModal = vm.newVendor;
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
        initializeForExistingLibrary();
    }

    function saveLibrary(){
        if (vm.libraryId !== undefined){
            libraryService.update( vm.library ).then(function(){
                alertService.putAlert('Library updated', {severity: 'success'});
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
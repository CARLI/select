angular.module('carli.sections.libraries.edit')
    .controller('editLibraryController', editLibraryController);

function editLibraryController( $location, $routeParams, libraryService ) {
    var vm = this;
    var libraryId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveLibrary = saveLibrary;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;

    vm.institutionYearsOptions = libraryService.getInstitutionYearsOptions();
    vm.institutionTypeOptions = libraryService.getInstitutionTypeOptions();
    vm.membershipLevelOptions = libraryService.getMembershipLevelOptions();

    activate();

    function activate() {
        if (libraryId === 'new') {
            initializeForNewLibrary();
        }
        else {
            initializeForExistingLibrary();
        }
    }
    function initializeForNewLibrary() {
        vm.library = {
            type: 'Library',
            name: 'New Library',
            contacts: []
        };
        vm.editable = true;
        vm.newLibrary = true;
    }
 
    function initializeForExistingLibrary() {
        vm.library = libraryService.load(libraryId);
        vm.editable = false;
        vm.newLibrary = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveLibrary(){
        if ( libraryId !== 'new' ){
            libraryService.update( vm.library );
        }
        else {
            libraryService.create( vm.library );
        }
        $location.path('/library');
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

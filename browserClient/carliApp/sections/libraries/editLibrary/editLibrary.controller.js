angular.module('carli.sections.libraries.edit')
    .controller('editLibraryController', editLibraryController);

function editLibraryController( $location, $routeParams, libraryService, alertService ) {
    var vm = this;
    var libraryId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveLibrary = saveLibrary;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;

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
            isActive: true,

            contacts: [
            ]

        };
        vm.editable = true;
        vm.newLibrary = true;
    }
 
    function initializeForExistingLibrary() {
        libraryService.load(libraryId).then( function( library ) {
          vm.library = library;
        } );
        vm.editable = false;
        vm.newLibrary = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveLibrary(){
        console.log('libraryid=' + libraryId);
        if ( libraryId !== 'new' ){
            libraryService.update( vm.library ).then(function(){
                alertService.putAlert('Library updated', {severity: 'success'});
                $location.path('/library');
            })
            .catch(function(error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
        }
        else {
            libraryService.create( vm.library ).then(function(){
                alertService.putAlert('Library created', {severity: 'success'});
                $location.path('/library');
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

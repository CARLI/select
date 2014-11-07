angular.module('carli.sections.licenses.edit')
    .controller('editLicenseController', editLicenseController);

function editLicenseController( $location, $routeParams, licenseService ) {
    var vm = this;
    var licenseId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveLicense = saveLicense;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;

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
        if (licenseId === 'new') {
            initializeForNewLicense();
        }
        else {
            initializeForExistingLicense();
        }
    }
    function initializeForNewLicense() {
        vm.license = {
            type: 'License',
            isActive: true,
            contacts: []
        };
        vm.editable = true;
        vm.newLicense = true;
    }
    function initializeForExistingLicense() {
        vm.license = licenseService.load(licenseId);
        vm.editable = false;
        vm.newLicense = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveLicense(){
        if ( licenseId !== 'new' ){
            licenseService.update( vm.license );
        }
        else {
            licenseService.create( vm.license );
        }
        $location.path('/license');
    }

    function addContact(contactType) {
        vm.license.contacts.push({
            contactType: contactType
        });
    }

    function deleteContact(contact) {
        var contactIndex = vm.license.contacts.indexOf(contact);
        if (contactIndex >= 0) {
            vm.license.contacts.splice(contactIndex, 1);
        }
    }
}

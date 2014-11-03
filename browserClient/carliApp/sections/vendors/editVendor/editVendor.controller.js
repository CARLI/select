angular.module('carli.sections.vendors.edit')
    .controller('editVendorController', editVendorController);

function editVendorController( $location, $routeParams, vendorService ) {
    var vm = this;
    var vendorId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveVendor = saveVendor;
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
        if (vendorId === 'new') {
            initializeForNewVendor();
        }
        else {
            initializeForExistingVendor();
        }
    }
    function initializeForNewVendor() {
        vm.vendor = {
            isActive: true,
            contacts: []
        };
        vm.editable = true;
    }
    function initializeForExistingVendor() {
        vm.vendor = vendorService.load(vendorId);
        vm.editable = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveVendor(){
        if ( vendorId !== 'new' ){
            vendorService.update( vm.vendor );
        }
        else {
            vendorService.create( vm.vendor );
        }
        $location.path('/vendor');
    }

    function addContact(contactType) {
        vm.vendor.contacts.push({
            contactType: contactType
        });
    }

    function deleteContact(contact) {
        var contactIndex = vm.vendor.contacts.indexOf(contact);
        if (contactIndex >= 0) {
            vm.vendor.contacts.splice(contactIndex, 1);
        }
    }
}

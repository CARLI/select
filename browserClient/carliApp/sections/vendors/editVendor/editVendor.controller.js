angular.module('carli.sections.vendors.edit')
    .controller('editVendorController', editVendorController);

function editVendorController( $location, $routeParams, vendorService, alertService ) {
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
            type: 'Vendor',
            isActive: true,
            contacts: []
        };
        vm.editable = true;
        vm.newVendor = true;
    }
    function initializeForExistingVendor() {
        vm.vendor = vendorService.load(vendorId);
        vm.editable = false;
        vm.newVendor = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveVendor(){
        if ( vendorId !== 'new' ){
            vendorService.update( vm.vendor );
            alertService.putAlert('Vendor updated', {severity: 'success'});
        }
        else {
            vendorService.create( vm.vendor );
            alertService.putAlert('Vendor added', {severity: 'success'});
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

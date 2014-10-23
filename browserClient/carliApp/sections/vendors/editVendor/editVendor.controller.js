angular.module('carli.sections.vendors.edit')
.controller('editVendorController', editVendorController);

function editVendorController( $location, $routeParams, vendorService ){
    var vm = this;

    vm.vendor = {
        name: 'New Vendor',
        contacts: []
    };

    var vendorId = $routeParams.id;

    if ( vendorId !== 'new' ) {
        vm.vendor = vendorService.getVendor(vendorId);
    }

    vm.saveVendor = function(){
        vendorService.create( vm.vendor );
        $location.path('/vendor');
    };
}

editVendorController.prototype.addContact = function addContact(contactType) {
    this.vendor.contacts.push({
        contactType: contactType
    });
};

editVendorController.prototype.deleteContact = function deleteContact(contact) {
    var contactIndex = this.vendor.contacts.indexOf(contact);
    if (contactIndex > 0) {
        this.vendor.contacts.splice(contactIndex, 1);
    }
};

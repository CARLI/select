angular.module('carli.sections.vendors.edit')
.controller('editVendorController', editVendorController);

function editVendorController( $routeParams, vendorService ){
    var vm = this;

    vm.vendor = {
        name: 'New Vendor'
    };

    var vendorId = $routeParams.id;

    if ( vendorId !== 'new' ) {
        vm.vendor = vendorService.getVendor(vendorId);
    }
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

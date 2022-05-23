angular.module('library.vendorSalesContact')
    .controller('vendorSalesContactController', vendorSalesContactController);

function vendorSalesContactController() {
    var vm = this;

    vm.contact = null;

    activate();

    function activate() {
        findFirstSalesContact();
    }

    function findFirstSalesContact() {
        if ( vm.vendor && vm.vendor.contacts && vm.vendor.contacts.length ) {
            var salesContacts = vm.vendor.contacts.filter(salesContact);

            if ( salesContacts.length ){
                vm.contact = salesContacts[0];
            }
        }

        function salesContact(contact) {
            return contact.contactType === 'Sales';
        }
    }
}
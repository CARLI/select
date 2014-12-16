angular.module('carli.entityForms.vendor')
    .controller('editVendorController', editVendorController);

function editVendorController( $scope, entityBaseService, vendorService, alertService ) {
    var vm = this;

    vm.vendorId = $scope.vendorId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.saveVendor = saveVendor;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;
    vm.closeModal = function() {
        $('#new-vendor-modal').modal('hide');
    };

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
        if (vm.vendorId === undefined) {
            initializeForNewVendor();
        }
        else {
            initializeForExistingVendor();
        }
        vm.isModal = vm.newVendor;
    }
    function initializeForNewVendor() {
        vm.vendor = {
            type: 'Vendor',
            isActive: true,
            contacts: [
                { contactType: 'Billing' },
                { contactType: 'Sales' },
                { contactType: 'Technical' }
            ]
        };
        vm.editable = true;
        vm.newVendor = true;
    }
    function initializeForExistingVendor() {
        vendorService.load(vm.vendorId).then( function( vendor ) {
            vm.vendor = vendor;
        } );
        vm.editable = false;
        vm.newVendor = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        vm.editable = false;
        activate();
    }

    function saveVendor() {

        if (vm.vendorId !== undefined) {
            vendorService.update(vm.vendor)
                .then(function () {
                    alertService.putAlert('Vendor updated', {severity: 'success'});
                    afterSubmitCallback();
                })
                .catch(function (error) {
                    alertService.putAlert(error, {severity: 'danger'});
                });
        }
        else {
            vendorService.create(vm.vendor)
                .then(function () {
                    alertService.putAlert('Vendor added', {severity: 'success'});
                    afterSubmitCallback();
                    initializeForNewVendor();
                })
                .catch(function (error) {
                    alertService.putAlert(error, {severity: 'danger'});
                });
        }
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

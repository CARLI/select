angular.module('carli.entityForms.vendor')
    .directive('editVendor', editVendor)
    .directive('editVendorModal', editVendorModal);

function editVendor() {
    var directive = _editVendorBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/vendor/editVendor.html';
    return directive;
}

function editVendorModal() {
    var directive = _editVendorBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/vendor/editVendorModal.html';
    return directive;
}

function _editVendorBaseDirective() {
    return {
        restrict: 'E',
        scope: { vendorId: '=', afterSubmitFn: '=' },
        controller: editVendorController,
        controllerAs: 'vm',
        bindToController: true
    };
}

function editVendorController( $location, vendorService, alertService ) {
    var vm = this;

    vm.toggleEditable = toggleEditable;
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

    function saveVendor(){
        if ( vm.vendorId !== undefined ){
            vendorService.update( vm.vendor ).then(function(){
                alertService.putAlert('Vendor updated', {severity: 'success'});
                $location.path('/vendor');
                if (vm.afterSubmitFn !== undefined) {
                    vm.afterSubmitFn();
                }
            })
            .catch(function(error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
        }
        else {
            vendorService.create( vm.vendor ).then(function(){
                alertService.putAlert('Vendor added', {severity: 'success'});
                $location.path('/vendor');
                if (vm.afterSubmitFn !== undefined) {
                    vm.afterSubmitFn();
                }
            })
            .catch(function(error) {
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

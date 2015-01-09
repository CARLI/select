angular.module('carli.entityForms.vendor')
    .controller('editVendorController', editVendorController);

function editVendorController( $scope, $rootScope, entityBaseService, vendorService, productService, licenseService, alertService ) {
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

    vm.statusOptions = entityBaseService.getStatusOptions();

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
        setVendorFormPristine();
    }
    function initializeForExistingVendor() {
        vendorService.load(vm.vendorId).then( function( vendor ) {
            vm.vendor = vendor;
        } );
        getActiveProducts();
        getActiveLicenses();
        vm.editable = false;
        vm.newVendor = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        vm.editable = false;
        activate();
        setVendorFormPristine();
    }

    function setVendorFormPristine() {
        if ($scope.vendorForm) {
            $scope.vendorForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.vendorForm) {
            $rootScope.forms.vendorForm.$setPristine();
        }
    }

    function saveVendor() {

        if (vm.vendorId !== undefined) {
            vendorService.update(vm.vendor)
                .then(function () {
                    alertService.putAlert('Vendor updated', {severity: 'success'});
                    setVendorFormPristine();
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
                    initializeForNewVendor();
                    afterSubmitCallback();
                })
                .catch(function (error) {
                    alertService.putAlert(error, {severity: 'danger'});
                });
        }
    }

    function getActiveProducts() {
        productService.listProductsForVendorId(vm.vendorId).then ( function ( productList ) {
            vm.productList = productList.filter(_entityIsActive);
        });
    }

    function getActiveLicenses() {
        licenseService.listLicensesForVendorId(vm.vendorId).then ( function ( licenseList ) {
            vm.licenseList = licenseList.filter(_entityIsActive);
        });
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

    function _entityIsActive( entity ){
        return entity && entity.isActive;
    }
}

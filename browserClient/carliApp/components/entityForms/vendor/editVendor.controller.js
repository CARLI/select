angular.module('carli.entityForms.vendor')
    .controller('editVendorController', editVendorController);

function editVendorController( $scope, $rootScope, $q, $window, activityLogService, config, entityBaseService, alertService, cycleService, errorHandler, licenseService, productService, vendorService, userService ) {
    var vm = this;

    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.enableMasquerading = true;
    vm.vendorId = $scope.vendorId;
    vm.vendorAppBrowsingContextId = config.vendorAppBrowsingContextId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.masquerade = masquerade;
    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.saveVendor = saveVendor;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.masqueradeAsVendorUrl = null;

    vm.statusOptions = entityBaseService.getStatusOptions();
    vm.otpAccessOptions = [
        {
            label: 'May offer products',
            value: true
        },
        {
            label: 'May not offer products',
            value: false
        }
    ];

    setupModalClosingUnsavedChangesWarning();
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
        vendorService
            .load(vm.vendorId).then( function( vendor ) {
                vm.vendor = angular.copy(vendor);
                setVendorFormPristine();
            })
            .then(setMasqueradeAsVendorUrl);
        watchCurrentCycle();
        vm.editable = false;
        vm.newVendor = false;
    }

    function watchCurrentCycle() {
        $scope.$watch(cycleService.getCurrentCycle, function (newValue) {
            if (newValue) {
                getActiveProducts();
                getActiveLicenses();
            }
        });
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
        setVendorFormPristine();
    }

    function cancelEdit(){
        if ( vm.isModal ){
            return;
        }
        else {
            resetVendorForm();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#new-vendor-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetVendorForm() {
        activate();
    }

    function hideModal() {
        $('#new-vendor-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( vendorFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetVendorForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function vendorFormIsDirty(){
        if ($scope.vendorForm) {
            return $scope.vendorForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.vendorForm) {
            return $rootScope.forms.vendorForm.$dirty;
        }
        return false;
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
        removeEmptyContacts();

        if (isNewVendor()) {
            createVendor();
        } else {
            updateVendor();
        }
    }

    function isNewVendor() {
        return vm.vendorId === undefined;
    }

    function addVendorIdToModel(newVendorId) {
        vm.vendor.id = newVendorId;
    }

    function createVendor() {
        vendorService.create(vm.vendor)
            .then(addVendorIdToModel)
            .then(addVendorToActiveCycles)
            .then(notifyUser)
            .then(logAddActivity)
            .then(resetVendorForm)
            .then(hideModal)
            .then(afterSubmitCallback)
            .catch(errorHandler);

        function notifyUser() {
            alertService.putAlert('Vendor added', {severity: 'success'});
        }
    }

    function updateVendor() {
        vendorService.update(vm.vendor)
            .then(notifyUser)
            .then(resetVendorForm)
            .then(hideModal)
            .then(afterSubmitCallback)
            .then(logAddActivity)
            .catch(errorHandler);

        function notifyUser() {
            alertService.putAlert('Vendor updated', {severity: 'success'});
        }
    }

    function addVendorToActiveCycles() {
        Logger.log('createVendorDatabasesForActiveCycles');

        return vendorService.createVendorDatabasesForActiveCyclesForSingleVendor(vm.vendor.id)
            .then(replicateToVendorForActiveCycles)
            .then(function (result) {
                console.log('Returned from replication', result);
            });

        function replicateToVendorForActiveCycles() {
            Logger.log('replicateToVendorForActiveCycles');
            cycleService.listActiveCycles().then(function (cycles) {
                return $q.all( cycles.map(replicateToVendorForCycle) );
            });
        }

        function replicateToVendorForCycle(cycle) {
            return vendorService.replicateDataToOneVendorForCycle(vm.vendor.id, cycle.id);
        }
    }

    function getActiveProducts() {
        return productService.listActiveProductsForVendorId(vm.vendorId).then(function ( productList ) {
            vm.productList = productList;
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

    function removeEmptyContacts() {
        var nonEmptyContacts = [];

        vm.vendor.contacts.forEach(keepNonEmptyContact);
        vm.vendor.contacts = nonEmptyContacts;

        function keepNonEmptyContact(contact){
            if ((contact.name && contact.name.length > 0) ||
                (contact.email && contact.email > 0) ||
                (contact.phoneNumber && contact.phoneNumber > 0)) {
                nonEmptyContacts.push(contact);
            }
        }
    }

    function _entityIsActive( entity ){
        return entity && entity.isActive;
    }

    function logUpdateActivity(){
        return activityLogService.logEntityModified(vm.vendor);
    }

    function logAddActivity(){
        return activityLogService.logEntityAdded(vm.vendor);
    }

    function setMasqueradeAsVendorUrl() {
        vm.masqueradeAsVendorUrl = getMasqueradeAsVendorUrl();
    }
    function getMasqueradeAsVendorUrl() {
        var queryString = '?masquerade-as-vendor=' + vm.vendor.id;
        return config.vendorWebAppUrl + queryString;
    }

    function masquerade() {
        userService.configureForMasquerading("vendor", vm.vendor.id)
            .then(openTheVendorApp)
            .catch(errorHandler);

        function openTheVendorApp() {
            $window.open(vm.masqueradeAsVendorUrl, vm.vendorAppBrowsingContextId);
        }
    }

}

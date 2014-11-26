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
        controller: 'editVendorController',
        controllerAs: 'vm'
    };
}



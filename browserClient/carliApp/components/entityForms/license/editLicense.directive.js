angular.module('carli.entityForms.license')
    .directive('editLicense', editLicense)
    .directive('editLicenseModal', editLicenseModal);

function editLicense() {
    var directive = _editLicenseBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/license/editLicense.html';
    return directive;
}

function editLicenseModal() {
    var directive = _editLicenseBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/license/editLicenseModal.html';
    return directive;
}

function _editLicenseBaseDirective() {
    return {
        restrict: 'E',
        scope: { licenseId: '=', afterSubmitFn: '=' },
        controller: 'editLicenseController',
        controllerAs: 'vm'
    };
}



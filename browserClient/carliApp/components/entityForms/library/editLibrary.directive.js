angular.module('carli.entityForms.library')
    .directive('editLibrary', editLibrary)
    .directive('editLibraryModal', editLibraryModal);

function editLibrary() {
    var directive = _editLibraryBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/library/editLibrary.html';
    return directive;
}

function editLibraryModal() {
    var directive = _editLibraryBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/library/editLibraryModal.html';
    return directive;
}

function _editLibraryBaseDirective() {
    return {
        restrict: 'E',
        scope: { libraryId: '=', afterSubmitFn: '=' },
        controller: 'editLibraryController',
        controllerAs: 'vm'
    };
}



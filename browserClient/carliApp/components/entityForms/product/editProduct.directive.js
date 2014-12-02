angular.module('carli.entityForms.product')
    .directive('editProduct', editProduct)
    .directive('editProductModal', editProductModal);

function editProduct() {
    var directive = _editProductBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/product/editProduct.html';
    return directive;
}

function editProductModal() {
    var directive = _editProductBaseDirective();
    directive.templateUrl = 'carliApp/components/entityForms/product/editProductModal.html';
    return directive;
}

function _editProductBaseDirective() {
    return {
        restrict: 'E',
        scope: { productId: '=', afterSubmitFn: '=' },
        controller: 'editProductController',
        controllerAs: 'vm'
    };
}



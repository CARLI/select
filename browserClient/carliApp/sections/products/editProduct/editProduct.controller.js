angular.module('carli.sections.products.edit')
    .controller('editProductController', editProductController);

function editProductController( $location, $routeParams, productService ) {
    var vm = this;
    var productId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveProduct = saveProduct;
    vm.addContact = addContact;
    vm.deleteContact = deleteContact;

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
        if (productId === 'new') {
            initializeForNewProduct();
        }
        else {
            initializeForExistingProduct();
        }
    }
    function initializeForNewProduct() {
        vm.product = {
            type: 'Product',
            isActive: true,
            contacts: []
        };
        vm.editable = true;
        vm.newProduct = true;
    }
    function initializeForExistingProduct() {
        vm.product = productService.load(productId);
        vm.editable = false;
        vm.newProduct = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveProduct(){
        if ( productId !== 'new' ){
            productService.update( vm.product );
        }
        else {
            productService.create( vm.product );
        }
        $location.path('/product');
    }

    function addContact(contactType) {
        vm.product.contacts.push({
            contactType: contactType
        });
    }

    function deleteContact(contact) {
        var contactIndex = vm.product.contacts.indexOf(contact);
        if (contactIndex >= 0) {
            vm.product.contacts.splice(contactIndex, 1);
        }
    }
}

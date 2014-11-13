angular.module('carli.sections.products.edit')
    .controller('editProductController', editProductController);

function editProductController( $location, $routeParams, productService, alertService ) {
    var vm = this;
    var productId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveProduct = saveProduct;

    //TODO: Move to someplace common since it's on Product, Library, and Product now
    vm.statusOptions = [
        {
            label: 'Active Product',
            value: true
        },
        {
            label: 'Inactive Product',
            value: false
        }
    ];

    //TODO: Move this someplace more common than here (Cycle Service?)
    vm.cycleOptions = [
        "Fiscal Year",
        "Calendar Year",
        "One-Time Purchases",
        "Alternative Cycle"
    ];

    vm.productDetailCodeOptions = [
        "USIA - Membership",
        "USIB - Database",
        "USIE - Misc.",
        "USIF - I-Share",
        "USIG - Chronicle of Higher Education",
        "USIH - OED",
        "USII - Spring Database",
        "USIJ - Fall Database",
        "USIK - SFX",
        "USIL - SFX",
        "USIM - I-Share Pre-Pay",
        "USIN - Database Pre-Pay"
    ];

    vm.termTypes = [
        "Download",
        "ILL",
        "Course Packs",
        "Print",
        "Limited Sharing for Scholarly Purposes",
        "Use by Walk-ins",
        "E-Reserves"
    ];

    vm.termOptions = [
        "Yes",
        "No",
        "Other"
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
        productService.load(productId).then( function( product ) {
            vm.product = product;
        } );
        vm.editable = false;
        vm.newProduct = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveProduct(){
        if ( productId !== 'new' ){
            productService.update( vm.product ).then(function(){
                alertService.putAlert('Product updated', {severity: 'success'});
                $location.path('/product');
            })
            .catch(function(error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
        }
        else {
            productService.create( vm.product ).then(function(){
                alertService.putAlert('Product added', {severity: 'success'});
                $location.path('/product');
            })
            .catch(function(error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
        }
    }
}

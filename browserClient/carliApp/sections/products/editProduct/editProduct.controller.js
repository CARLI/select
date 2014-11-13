angular.module('carli.sections.products.edit')
    .controller('editProductController', editProductController);

function editProductController( $location, $routeParams, productService ) {
    var vm = this;
    var productId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveProduct = saveProduct;

    //TODO: Move to someplace common since it's on Vendor, Library, and Product now
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
}

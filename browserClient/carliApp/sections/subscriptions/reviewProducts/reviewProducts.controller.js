angular.module('carli.sections.subscriptions.placeholder')
    .controller('reviewProductsController', reviewProductsController);

function reviewProductsController( $routeParams, cycleService, productService, vendorService ) {
    var vm = this;
    vm.cycleId = $routeParams.id;

    activate();

    function activate () {
        initYearsToDisplay();
        loadCycle();
        loadProducts();
        loadVendors();
    }

    function initYearsToDisplay() {
        vm.yearsToDisplay = [];
        for (var y = 2010; y < 2015; y++) {
            vm.yearsToDisplay.push(y);
        }
    }

    function loadCycle() {
        cycleService.load(vm.cycleId).then(function (cycle) {
            vm.cycle = cycle;
        });
    }

    function loadVendors() {
        vendorService.list().then(function (vendors) {
            vm.vendors = vendors;
        });
    }

    function loadProducts() {
        productService.list().then(function (products) {
            vm.products = products;
            angular.forEach(products, function (product) {
                product.selectionHistory = {};
                for (var i = 0; i < vm.yearsToDisplay.length; i++) {
                    var y = vm.yearsToDisplay[i];
                    product.selectionHistory[y] = _pickRandomSelectionHistory();
                }
            });
        });
    }
    function _pickRandomSelectionHistory() {
        switch (getRandomInt(0, 2)) {
            case 0: return '-';
            case 1: return '×';
            case 2: return '✓';
        }
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

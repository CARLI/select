angular.module('vendor.quickPricing')
    .controller('quickPricingProductSelectorController', quickPricingProductSelectorController);

function quickPricingProductSelectorController() {
    var vm = this;

    vm.alphaFilter = null;
    vm.alphaFilterFunction = null;
    vm.selectAll = selectAll;
    vm.selectNone = selectNone;
    vm.setAlphaFilter = setAlphaFilter;

    var filterFunctions = null;

    activate();

    function activate() {
        filterFunctions = {
            'a-f': makeAlphaFilterFunction('a', 'f'),
            'g-l': makeAlphaFilterFunction('g', 'l'),
            'm-r': makeAlphaFilterFunction('m', 'r'),
            's-z': makeAlphaFilterFunction('s', 'z'),
            'all': function() { return true; }
        };

        setAlphaFilter('all');
    }

    function selectAll() {
        Object.keys(vm.selectedProductIds).forEach(function(productId) {
            vm.selectedProductIds[productId] = true;
        });
        setAlphaFilter('all');
    }
    function selectNone() {
        Object.keys(vm.selectedProductIds).forEach(function(productId) {
            vm.selectedProductIds[productId] = false;
        });
        setAlphaFilter('all');
    }

    function setAlphaFilter(filterKey) {
        vm.alphaFilter = filterKey;
        vm.alphaFilterFunction = filterFunctions[filterKey];
    }

    function makeAlphaFilterFunction(lower,upper){
        return function filterByFirstLetter(product) {
            var firstLetter = product.name[0].toLowerCase();
            return firstLetter >= lower && firstLetter <= upper;
        };
    }
}

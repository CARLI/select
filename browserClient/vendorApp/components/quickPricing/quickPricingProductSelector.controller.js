angular.module('vendor.quickPricing')
    .controller('quickPricingProductSelectorController', quickPricingProductSelectorController);

function quickPricingProductSelectorController() {
    var vm = this;

    vm.filter = null;
    vm.filterFunction = null;
    vm.selectAll = selectAll;
    vm.setFilter = setFilter;

    var filterFunctions = null;

    activate();

    function activate() {
        filterFunctions = {
            'a-f': makeFilterFunction('a', 'f'),
            'g-l': makeFilterFunction('g', 'l'),
            'm-r': makeFilterFunction('m', 'r'),
            's-z': makeFilterFunction('s', 'z'),
            'all': function() { return true; }
        };

        setFilter('all');
    }

    function selectAll() {
        Object.keys(vm.selectedProductIds).forEach(function(productId) {
            vm.selectedProductIds[productId] = true;
        });
        setFilter('all');
    }

    function setFilter(filterKey) {
        vm.filter = filterKey;
        vm.filterFunction = filterFunctions[filterKey];
    }

    function makeFilterFunction(lower,upper){
        return function filterByFirstLetter(product) {
            var firstLetter = product.name[0].toLowerCase();
            return firstLetter >= lower && firstLetter <= upper;
        }
    }
}
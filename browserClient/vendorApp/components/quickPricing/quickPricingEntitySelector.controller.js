angular.module('vendor.quickPricing')
    .controller('quickPricingEntitySelectorController', quickPricingEntitySelectorController);

function quickPricingEntitySelectorController() {
    var vm = this;

    vm.alphaFilter = null;
    vm.alphaFilterFunction = null;
    vm.selectAll = selectAll;
    vm.selectNone = selectNone;
    vm.setAlphaFilter = setAlphaFilter;

    var filterFunctions = null;

    activate();

    function activate() {
        if ( !vm.orderBy ){
            vm.orderBy = 'name';
        }

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
        Object.keys(vm.selectedEntityIds).forEach(function(entityId) {
            vm.selectedEntityIds[entityId] = true;
        });
        setAlphaFilter('all');
    }
    function selectNone() {
        Object.keys(vm.selectedEntityIds).forEach(function(entityId) {
            vm.selectedEntityIds[entityId] = false;
        });
        setAlphaFilter('all');
    }

    function setAlphaFilter(filterKey) {
        vm.alphaFilter = filterKey;
        vm.alphaFilterFunction = filterFunctions[filterKey];
    }

    function makeAlphaFilterFunction(lower,upper){
        return function filterByFirstLetter(entity) {
            var firstLetter = entity.name[0].toLowerCase();
            return firstLetter >= lower && firstLetter <= upper;
        };
    }
}

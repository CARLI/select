angular.module('carli.entityForms.priceCaps')
    .controller('managePriceCapsController', managePriceCapsController);

function managePriceCapsController() {
    var vm = this;
    vm.addPriceCapRow = addPriceCapRow;

    function addPriceCapRow() {
        vm.entity.futurePriceCaps = vm.entity.futurePriceCaps || {};
        var priceCaps = vm.entity.futurePriceCaps;
        var nextYear = findMaxPriceCapYear(priceCaps) + 1;
        priceCaps[nextYear] = 0;

        function findMaxPriceCapYear(priceCapsObject){
            return  1 * (Object.keys(priceCapsObject).sort().reverse()[0] || vm.year);
        }
    }
}
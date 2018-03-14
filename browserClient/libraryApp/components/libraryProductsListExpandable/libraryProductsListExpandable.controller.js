angular.module('library.libraryProductsListExpandable')
    .controller('libraryProductsListExpandableController', libraryProductsListExpandableController);

function libraryProductsListExpandableController( $q, controllerBaseService, csvExportService, cycleService, offeringService, productService ){
    var vm = this;

    vm.loadingPromise = null;
    vm.selectedOfferings = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        license: ['product.license.name','product.name'],
        su: ['selection.users','product.name'],
        cost: [offeringService.getFundedSelectionPrice,'product.name']
    };

    vm.selectionTotal = selectionTotal;
    vm.getFundedSelectionPrice = offeringService.getFundedSelectionPrice;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.exportProductList = exportProductList;

    vm.openOfferings = {};
    vm.toggleOffering = toggleOffering;

    controllerBaseService.addSortable(vm, vm.sortOptions.productName);
    activate();

    function activate(){
        vm.loadingPromise = cycleService.listSelectionsForCycle(vm.cycle, vm.libraryId)
            .then(function( offerings ){
                vm.selectedOfferings = offerings;
            });
    }

    function selectionTotal(){
        var total = 0;

        if ( vm.selectedOfferings ){
            vm.selectedOfferings.forEach(function(offering){
                total += offeringService.getFundedSelectionPrice(offering);
            });
        }

        return total;
    }

    function exportProductList() {
        var fileName = vm.cycle.name + ' Product List.csv';
        var exportHeaders = [
            'Product',
            'Vendor',
            'License Agreement',
            'Comments',
            'S.U.',
            'Cost'
        ];

        var exportData = vm.selectedOfferings.map(exportOffering);

        return csvExportService.exportToCsv(exportData, exportHeaders)
            .then(function (csvString) {
                return csvExportService.browserDownloadCsv(csvString, fileName);
            });

        function exportOffering(offering) {
            return [
                vm.getProductDisplayName(offering.product),
                offering.product.vendor.name,
                offering.product.license.name,
                offering.libraryComments,
                offering.selection.users,
                offeringService.getFundedSelectionPrice(offering)
            ];
        }
    }

    function toggleOffering(offering) {
        vm.openOfferings[offering.id] = !vm.openOfferings[offering.id];
    }
}
angular.module('library.sections.ipAddresses')
    .controller('ipAddressesController', ipAddressesController);

function ipAddressesController( $q, $filter ){
    var vm = this;
    vm.currentIPAddresses = [];

    vm.loadingPromise = null;

    activate();

    function activate(){
        initDataForControls();
        initCurrentIPList();
    }

    function initCurrentIPList(){
        vm.loadingPromise = TODO.listCurrentIPAddresses()
            .then(function(ipAddressList){
                vm.currentIPAddresses = ipAddressList;
            });
        return vm.loadingPromise;
    }

    function fetchSelectedProductsReportData(){
        vm.loadingPromise = $q.all( vm.selectedCycles.map(listSelections) )
            .then(sortResultsByCycleYear)
            .then(combineReportOfferings);

        return vm.loadingPromise;

        function listSelections(cycle){
            return cycleService.listSelectionsForCycle(cycle, currentLibrary.id);
        }

        function sortResultsByCycleYear(listOfResultArrays){
            return listOfResultArrays.sort(descendingChronologicalOrder);

            function descendingChronologicalOrder(listA, listB){
                return listB[0].cycle.year - listA[0].cycle.year;
            }
        }

        function combineReportOfferings(listOfResultArrays){
            var results = [];

            listOfResultArrays.forEach(addListOfOfferingsToResults);

            function addListOfOfferingsToResults(listOfResults){
                $filter('orderBy')(listOfResults, 'product.name');

                listOfResults.forEach(function(offering){
                    results.push({
                        cycle: offering.cycle.name,
                        product: productService.getProductDisplayName(offering.product),
                        vendor: offering.product.vendor.name,
                        isFunded: offeringService.isFunded(offering) ? 'true' : 'false',
                        selection: offering.selection.users,
                        price: offeringService.getFundedSelectionPrice(offering),
                        comment: offering.libraryComments
                    });
                });
            }

            return results;
        }
    }
}

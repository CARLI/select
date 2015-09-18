angular.module('library.sections.report')
    .controller('reportController', reportController);

function reportController( $q, $filter, csvExportService, cycleService, productService, userService ){
    var vm = this;

    var currentUser = userService.getUser();
    var currentLibrary = currentUser.library;

    vm.loadingPromise = null;
    vm.selectedCycles = [];

    vm.downloadReportCsv = downloadReportCsv;

    activate();

    function activate(){
        initDataForControls();
    }

    function initDataForControls(){
        vm.loadingPromise = cycleService.listClosedAndArchivedCycles()
            .then(function(cycleList){
                vm.cycles = cycleList;
            });
        return vm.loadingPromise;
    }

    function downloadReportCsv(){
        var columns = {
            cycle: 'Cycle',
            product: 'Product',
            vendor: 'Vendor',
            selection: 'Selection',
            price: 'Price',
            comment: 'Comments'
        };

        return fetchSelectedProductsReportData()
            .then(function(results){
                return csvExportService.exportToCsv(results, columns);
            })
            .then(function(csvContent){
                return csvExportService.browserDownloadCsv(csvContent, makeFilename());
            });


        function makeFilename(){
            return currentLibrary.name + ' Selected Products ' + new Date().toISOString().substr(0,16).replace('T','-');
        }
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
                        selection: offering.selection.users,
                        price: offering.selection.price,
                        comment: offering.libraryComments
                    });
                });
            }

            return results;
        }
    }
}
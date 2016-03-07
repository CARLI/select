angular.module('carli.sections.reports')
.controller('reportsController', reportsController);

function reportsController( $q, csvExportService, cycleService, libraryService, productService, reportDataService, vendorService ){
    var vm = this;

    vm.reportOptions = {};
    vm.reportRunningPromise = null;
    vm.cycleControlIsMissingValue = cycleControlIsMissingValue;
    vm.selectedReport = null;
    vm.selectedVendors = [];

    vm.loadVendorsPromise = loadVendorsPromise;
    vm.loadLibrariesPromise = loadLibrariesPromise;
    vm.loadProductsForVendors = loadProductsForVendors;
    vm.reportWantsProductsAndCyclesAreSelected = reportWantsProductsAndCyclesAreSelected;
    vm.reportWantsProductsAndVendorsAreSelected = reportWantsProductsAndVendorsAreSelected;
    vm.reportWantsLibrariesAndCyclesAreSelected = reportWantsLibrariesAndCyclesAreSelected;

    /**
     * Reports
     *
     * name: display name
     * controls: which parameters of the report can be adjusted.
     * optionalColumns: Columns of the report output that are optional and can be disabled by the user.
     *
     */
    vm.availableReports = [
        {
            name: 'All Pricing',
            controls: {
                cycle: 'all',
                vendor: 'all',
                product: 'all',
                library: 'all'
            },
            optionalColumns: []
        },
        {
            name: 'Selected Products',
            controls: {
                cycle: 'all'
            },
            optionalColumns: [
                'detailCode'
            ]
        },
        {
            name: 'Library Contacts',
            optionalColumns: []
        },
        {
            name: 'Statistics',
            controls: {
                cycle: 'all'
            },
            optionalColumns: []
        },
        {
            name: 'Selections by Vendor',
            controls: {
                cycle: 'all'
            },
            optionalColumns: [
                'detailCode'
            ]
        },
        {
            name: 'Totals',
            controls: {
                cycle: 'all'
            },
            optionalColumns: []
        },
        {
            name: 'List all Products for Vendor',
            controls: {
                cycle: 'all'
            },
            optionalColumns: [
                'detailCode'
            ]
        },
        {
            name: 'Contracts',
            controls: {
                cycle: 'all'
            },
            optionalColumns: []
        },
        {
            name: 'Product Names',
            controls: {
                cycle: 'all'
            },
            optionalColumns: []
        },
        {
            name: 'List Libraries',
            optionalColumns: [
                'fte',
                'institutionType',
                'institutionYears',
                'membershipLevel',
                'isIshareMember',
                'isActive'
            ]
        }
    ];

    vm.downloadReportCsv = downloadReportCsv;
    vm.setupSelectedReport = setupSelectedReport;

    activate();

    function activate(){
        initDataForControls();
    }

    function initDataForControls(){
        vm.reportRunningPromise = cycleService.list()
            .then(function(cycleList){
                vm.cycles = cycleList;
            });
    }

    function setupSelectedReport(){
        vm.reportOptions = {
            optionalColumns: {},
            parameters: {}
        };

        vm.selectedReport.optionalColumns.forEach(function(column){
            vm.reportOptions.optionalColumns[column] = true;
        });
    }

    function cycleControlIsMissingValue(){
        var value = false;
        if ( vm.selectedReport.controls ){
            value = vm.selectedReport.controls.cycle && !vm.reportOptions.parameters.cycle;
        }
        return value;
    }

    function downloadReportCsv(){
        var reportName = vm.selectedReport.name;
        var parameters = vm.reportOptions.parameters;
        var optionalColumns = vm.reportOptions.optionalColumns;

        vm.reportRunningPromise = reportDataService.getDataForReport(reportName, parameters, optionalColumns)
            .then(function(reportData){
                return csvExportService.exportToCsv(reportData.data, reportData.columns);
            })
            .then(function(csvContent){
                csvExportService.browserDownloadCsv(csvContent, makeFilename());
            })
            .catch(function (err) {
                vm.reportRunningPromise = null;
                Logger.log('CSV generation failed', err);
            });

        return vm.reportRunningPromise;

        function makeFilename(){
            return 'CARLI-'+ reportName +'-report-' + new Date().toISOString().substr(0,16).replace('T','-');
        }
    }

    function reportWantsProductsAndCyclesAreSelected() {
        return vm.selectedReport.controls.product && cyclesAreSelected();
    }

    function reportWantsProductsAndVendorsAreSelected() {
        return vm.selectedReport.controls.product && vendorsAreSelected();
    }

    function reportWantsLibrariesAndCyclesAreSelected() {
        return vm.selectedReport.controls.library && cyclesAreSelected();
    }

    function cyclesAreSelected() {
        return vm.reportOptions.parameters.cycle && vm.reportOptions.parameters.cycle.length;
    }

    function vendorsAreSelected() {
        return vm.selectedVendors.length;
    }

    function loadVendorsPromise() {
        if ( !vm.loadingVendorPromise ) {
            vm.loadingVendorPromise = vendorService.list()
                .then(function(allVendors){
                    vm.vendors = allVendors;
                });
        }
        return vm.loadingVendorPromise;
    }

    function loadProductsForVendors() {
        vm.products = [];

        if ( !reportWantsProductsAndCyclesAreSelected() || !vendorsAreSelected() ){
            return;
        }

        vm.loadingProductsPromise = loadProductsForSelectedVendorsForSelectedCycles()
            .then(reduceToListOfUniqueProducts)
            .then(function(products) {
                vm.products = products;
            });


        function loadProductsForSelectedVendorsForSelectedCycles() {
            var selectedCycles = getSelectedCycles();
            var selectedVendors = vm.selectedVendors;
            var promisesForProductsByVendor = selectedVendors.map(loadProductsForVendorForSelectedCycles);

            var allProducts = flattenArraysOfArraysOfPromises(promisesForProductsByVendor);
            return $q.all( allProducts );


            function getSelectedCycles() {
                return vm.cycles.filter(cycleIsSelected);

                function cycleIsSelected(cycle) {
                    return vm.reportOptions.parameters.cycle.indexOf(cycle.id) >= 0;
                }
            }

            function loadProductsForVendorForSelectedCycles( vendorId ) {
                return selectedCycles.map(function(cycle) {
                    return productService.listProductsForVendorId(vendorId, cycle);
                });
            }

            function flattenArraysOfArraysOfPromises(arrayOfArrays){
                var flattenedArray = [];
                arrayOfArrays.forEach(function(subArray){
                    subArray.forEach(function(item) {
                        flattenedArray.push(item);
                    });
                });
                return flattenedArray;
            }
        }

        function reduceToListOfUniqueProducts(arrayOfProductsPerCycle){
            console.log('loaded ' + arrayOfProductsPerCycle.length + ' cycles of products products', arrayOfProductsPerCycle);
            var uniqueProductsById = {};
            arrayOfProductsPerCycle.forEach(function(arrayOfProducts) {
                arrayOfProducts.forEach(function(product) {
                    uniqueProductsById[product.id] = product;
                });
            });

            var uniqueProducts = Object.keys(uniqueProductsById).map(function(productId){
                return uniqueProductsById[productId];
            });

            return uniqueProducts;
        }
    }

    function loadLibrariesPromise() {
        if ( !vm.loadingLibrariesPromise ) {
            vm.loadingLibrariesPromise = libraryService.list()
                .then(function(allLibraries){
                    vm.libraries = allLibraries;
                });
        }
        return vm.loadingLibrariesPromise;
    }
}

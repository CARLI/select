angular.module('carli.sections.reports')
.controller('reportsController', reportsController);

function reportsController( csvExportService, cycleService, errorHandler, reportDataService ){
    var vm = this;

    vm.reportOptions = {};
    vm.reportRunningPromise = null;
    vm.selectedReport = null;

    /**
     * Reports
     *
     * name: display name
     * controls: which parameters of the report can be adjusted.
     * columns: columns of the report output that are optional and can be disabled by the user.
     *
     */
    vm.availableReports = [
        {
            name: 'Selected Products',
            controls: {
                cycle: 'all'
            },
            columns: [
                'vendor',
                'selection',
                'price',
                'detailCode'
            ]
        },
        {
            name: 'Library Contacts',
            columns: []
        },
        {
            name: 'Statistics',
            columns: []
        },
        {
            name: 'Selections by Vendor',
            columns: []
        },
        {
            name: 'Totals',
            columns: []
        },
        {
            name: 'List all Products for Vendor',
            columns: []
        },
        {
            name: 'Contracts',
            columns: []
        },
        {
            name: 'Product Names',
            columns: []
        },
        {
            name: 'List Libraries',
            columns: [
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
            columns: {},
            parameters: {}
        };

        vm.selectedReport.columns.forEach(function(column){
            vm.reportOptions.columns[column] = true;
        });
    }

    function downloadReportCsv(){
        var reportName = vm.selectedReport.name;
        var parameters = vm.reportOptions.parameters;
        var columns = vm.reportOptions.columns;

        return reportDataService.getDataForReport(reportName, parameters, columns)
            .then(function(reportData){
                return csvExportService.exportToCsv(reportData.data, reportData.columns);
            })
            .then(function(csvContent){
                csvExportService.browserDownloadCsv(csvContent, makeFilename());
            })
            .catch(function (err) {
                console.log('CSV generation failed', err);
            });

        function makeFilename(){
            return 'CARLI-'+ reportName +'-report-' + new Date().toISOString().substr(0,16).replace('T','-');
        }
    }
}

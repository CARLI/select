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
     * optionalColumns: Columns of the report output that are optional and can be disabled by the user.
     *
     */
    vm.availableReports = [
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
            optionalColumns: []
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
            optionalColumns: []
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

    function downloadReportCsv(){
        var reportName = vm.selectedReport.name;
        var parameters = vm.reportOptions.parameters;
        var optionalColumns = vm.reportOptions.optionalColumns;

        return reportDataService.getDataForReport(reportName, parameters, optionalColumns)
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

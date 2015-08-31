angular.module('carli.sections.reports')
.controller('reportsController', reportsController);

function reportsController( $scope, $q, alertService, cycleService, errorHandler, reportDataService ){
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
            name: 'Contacts'
        },
        {
            name: 'Statistics'
        },
        {
            name: 'Selections by Vendor'
        },
        {
            name: 'Totals'
        },
        {
            name: 'List all Products for Vendor'
        },
        {
            name: 'Contracts'
        },
        {
            name: 'Product Names'
        },
        {
            name: 'List Libraries',
            columns: [
                'fte',
                'institutionType',
                'institutionYears',
                'membership',
                'ishare',
                'status'
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
            columns: {}
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
                console.log('report data', reportData);
            });
    }
}

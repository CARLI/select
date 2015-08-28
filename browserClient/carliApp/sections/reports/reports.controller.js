angular.module('carli.sections.reports')
.controller('reportsController', reportsController);

function reportsController( $q, alertService, errorHandler, libraryService ){
    var vm = this;

    vm.reportRunningPromise = null;
    vm.selectedReport = null;
    vm.reportOptions = [
        {
            name: 'Selected Products'
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
            name: 'List Libraries plus Info'
        },
        {
            name: 'List Libraries'
        }
    ];

    vm.setupSelectedReport = setupSelectedReport;

    activate();

    function activate(){

    }

    function setupSelectedReport(){
        console.log('setup ',vm.selectedReport);
    }
}

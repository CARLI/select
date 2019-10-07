angular.module('carli.activityLogList')
.controller('activityLogListController', activityLogListController);

function activityLogListController(config, controllerBaseService, activityLogService){
    var vm = this;

    var datePickerFormat = 'M/D/YY';

    vm.appFilter = 'all';
    vm.columns = activityLogListColumns();

    vm.dateFilterStartDate = moment();
    vm.dateFilterEndDate = moment();
    vm.filterByApp = filterByApp;
    vm.updateActivityLogs = updateActivityLogs;

    controllerBaseService.addSortable(vm, 'date');

    activate();

    function activate(){
        vm.dateFilterStartDate = moment().subtract(2,'week').format();
        vm.dateFilterEndDate = moment().endOf('day').format();
        vm.loadingPromise = loadActivity();
    }

    function updateActivityLogs(){
        vm.loadingPromise = loadActivity();
    }

    function loadActivity(){
        var startDate = moment(vm.dateFilterStartDate).format();
        var endDate = moment(vm.dateFilterEndDate).endOf('day').format();

        return activityLogService.listActivityBetween(startDate, endDate).then(function(logs){
            vm.logs = logs;
        });
    }

    function filterByApp(value, index){
        if ( vm.appFilter === 'all' ){
            return true;
        }

        if ( value ){
            return value.app === vm.appFilter;
        }

        return false;
    }

    function activityLogListColumns(){
        return [
            {
                label: "Date",
                orderByProperty: 'date'
            },
            {
                label: "User",
                orderByProperty: 'userEmail'
            },
            {
                label: "Cycle",
                orderByProperty: 'cycleName'
            },
            {
                label: "Vendor",
                orderByProperty: 'vendorName'
            },
            {
                label: "Product",
                orderByProperty: 'productName'
            },
            {
                label: "Institution Name",
                orderByProperty: 'libraryName'
            },
            {
                label: "Action",
                orderByProperty: 'action'
            }
        ];
    }
}

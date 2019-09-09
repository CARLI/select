angular.module('carli.sections.dashboard')
    .controller('dashboardController', dashboardController);

function dashboardController($q, activityLogService, cycleService) {
    var vm = this;

    vm.cycles = [];
    vm.cyclesLoading = null;

    vm.totalsByCycle = {};

    vm.libraryActivity = libraryActivity;
    vm.oneTimePurchaseActivity = oneTimePurchaseActivity;
    vm.subscriptionActivity = subscriptionActivity;
    vm.subscriptionSummary = subscriptionSummary;

    activate();

    function activate() {
        vm.cyclesLoading = cycleService.listActiveSubscriptionCycles()
            .then(function (activeCycles) {
                vm.cycles = activeCycles;
                return activeCycles;
            })
            .then(function (cycles) {
                return $q.all(cycles.map(loadTotalsForCycle));
            });

        function loadTotalsForCycle(cycle) {
            return cycle.getCycleSelectionAndInvoiceTotals()
                .then(function (cycleTotals) {
                    vm.totalsByCycle[cycle.id] = cycleTotals;
                });
        }

        var startDate = moment().subtract(1, 'week').format();
        var endDate = moment().endOf('day').format();

        vm.activityLoading = activityLogService.listActivityBetween(startDate, endDate).then(function (logs) {
            vm.logs = logs;
        });
    }

    function libraryActivity(value, index) {
        return value.app === 'library';
    }

    function oneTimePurchaseActivity(value, index) {
        return value.app === 'library' && value.cycleId === 'one-time-purchase-products-cycle';
    }

    function subscriptionActivity(value, index) {
        return true;
    }

    function subscriptionSummary(activity) {
        if ( activity.app === 'staff' ) {
            return activity.actionDescription + ' - ' + activity.cycleName + ( activity.productName ? ' for ' + activity.productName : '');
        }
        else if ( activity.app === 'vendor' ) {
            return activity.vendorName + ' ' + activity.actionDescription + ' ' + activity.productName;
        }
        else {
            return activity.actionDescription + ' ' + activity.libraryName;
        }
    }

}

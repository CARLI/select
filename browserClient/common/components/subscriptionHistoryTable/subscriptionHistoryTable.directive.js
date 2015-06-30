angular.module('common.subscriptionHistoryTable')
    .directive('subscriptionHistoryTable', function(){
        return {
            restrict: 'E',
            template: [
                '<div class="headers">',
                '  <div class="h2">{{ vm.yearLabel }}</div>',
                '  <div class="h2">Subscribers</div>',
                '</div>',
                '<ul>',
                '  <li ng-repeat="row in vm.rows | orderBy:vm.orderBy:vm.reverse" class="{{ row.current }}">',
                '    <div class="cell"><span class="year">{{row.year}}</span>{{row.yourSelection}}</div>',
                '    <div class="cell"><span class="subscribers">{{row.subscribers}}</span></div>',
                '  </li>',
                '</ul>'
            ].join(''),
            scope: {
                cycle: '=',
                library: '=',
                product: '='
            },
            controller: 'subscriptionHistoryTableController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
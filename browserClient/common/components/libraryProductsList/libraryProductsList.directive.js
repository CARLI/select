angular.module('common.libraryProductsList')
.directive('libraryProductsList', function(){
    return {
        restrict: 'E',
        template: [
            '<ul class="product-list selected-products" cg-busy="vm.loadingPromise">',
            '    <li class="column-headers">',
            '        <div class="sortable column product" ng-class="{ activeSort: vm.orderBy === vm.sortOptions.productName, reversedSort: vm.reverse }" ng-click="vm.sort(vm.sortOptions.productName)">Product</div>',
            '        <div class="sortable column vendor" ng-class="{ activeSort: vm.orderBy === vm.sortOptions.vendorName, reversedSort: vm.reverse }" ng-click="vm.sort(vm.sortOptions.vendorName)">Vendor</div>',
            '        <div class="sortable column license" ng-class="{ activeSort: vm.orderBy === vm.sortOptions.license, reversedSort: vm.reverse }" ng-click="vm.sort(vm.sortOptions.license)">License Agreement</div>',
            '        <div class="sortable column su" ng-class="{ activeSort: vm.orderBy === vm.sortOptions.su, reversedSort: vm.reverse }" ng-click="vm.sort(vm.sortOptions.su)">S.U.</div>',
            '        <div class="sortable column cost" ng-class="{ activeSort: vm.orderBy === vm.sortOptions.cost, reversedSort: vm.reverse }" ng-click="vm.sort(vm.sortOptions.cost)">Cost</div>',
            '    </li>',
            '    <li ng-repeat="offering in vm.selectedOfferings | orderBy: vm.orderBy:vm.reverse track by offering.id">',
            '        <div class="column product">{{ offering.product.name }}</div>',
            '        <div class="column vendor">{{ offering.product.vendor.name }}</div>',
            '        <div class="column license">{{ offering.product.license.name }}</div>',
            '        <div class="column su">{{ offering.selection.users }}</div>',
            '        <div class="column cost">{{ offering.selection.price | currency }}</div>',
            '    </li>',
            '    <li class="summary-row">',
            '        <div class="column"><span class="total-label">Total</span></div>',
            '        <div class="column cost">{{ vm.selectionTotal() | currency }}</div>',
            '    </li>',
            '</ul>',
            '<div class="placeholder" style="width: 300px; margin: -45px 0 1rem;">Print | Export | Email</div>'
        ].join(''),
        scope: {
            cycle: '=',
            libraryId: '@'
        },
        controller: libraryProductsListController,
        controllerAs: 'vm',
        bindToController: true
    };
});
angular.module('common.viewEditDirectives.viewEditSuPricing')
    .directive('viewEditSuPricing', function () {
        return {
            restrict: 'E',
            template: [
                '<div class="edit-su-pricing" ng-class="{ \'edit-mode\': vm.editMode }">',
                '    <table>',
                '    <thead>',
                '        <tr>',
                '        <th><strong>{{ vm.year }}</strong> Price</th>',
                '        <th>User(s)</th>',
                '        </tr>',
                '    </thead>',
                '    <tbody>',
                '        <tr ng-repeat="price in vm.pricing track by $index">',
                '        <td><view-edit-price class="price" input-id="{{ vm.inputId }}Price{{ $index }}" edit-mode="vm.editMode" ng-model="price.price">{{ price.price | currency }}</view-edit-price></td>',
                '        <td>',
                '        <view-edit-integer class="users" input-id="{{ vm.inputId }}Users{{ $index }}" edit-mode="vm.editMode" ng-model="price.users">{{ price.users }}</view-edit-integer>',
                '        <button class="carli-button remove" ng-click="vm.removePriceRow($index)"><fa name="minus-circle">Remove S.U. Price</fa></button>',
                '        </td>',
                '        </tr>',
                '        <tr ng-show="vm.editMode" ng-click="vm.addPriceRow()"><td class="add-su-pricing" colspan="2"><button class="carli-button add">Add S.U. Price <fa name="plus-circle"></fa></button></td></tr>',
                '    </tbody>',
                '    </table>',
                '</div>'
            ].join(''),
            scope: {
                year: "=",
                pricing: '=ngModel',
                editMode: '=',
                inputId: '@'
            },
            controller: viewEditSuPricingController,
            controllerAs: 'vm',
            bindToController: true
        };
    });

function viewEditSuPricingController($scope) {
    var vm = this;

    vm.addPriceRow = addPriceRow;
    vm.removePriceRow = removePriceRow;

    activate();

    function activate() {
        vm.pricing = vm.pricing || [];
        sortPricing();
        $scope.$watch('vm.editMode', sortPricing);
    }

    function sortPricing() {
        if (vm.pricing) {
            vm.pricing.sort(sortByUsers);
        }
    }

    function sortByUsers(a, b) {
        return a.users > b.users;
    }

    function removePriceRow(indexToRemove) {
        vm.pricing = vm.pricing.filter(function (value, index) {
            return index !== indexToRemove;
        });
    }

    function addPriceRow() {
        vm.pricing.push({
            price: '',
            users: highestUser() + 1
        });
    }

    function highestUser() {
        var max = 0;
        vm.pricing.forEach(function (price) {
            if (price.users > max) {
                max = price.users;
            }
        });
        return max;
    }
}

angular.module('carli.entityList')
.controller('entityListController', entityListController );

function entityListController($scope) {
    var vm = this;

    vm.orderBy = $scope.orderBy || 'name';
    vm.reverse = false;

    vm.activeFilterState = 'Active';
    vm.filterText = '';

    vm.sort = function sort( newOrderBy ){
        if ( !newOrderBy ){
            return;
        }

        if ( vm.orderBy === newOrderBy){
            vm.reverse = !vm.reverse;
        }
        else {
            vm.orderBy = newOrderBy;
            vm.reverse = false;
        }
    };
}

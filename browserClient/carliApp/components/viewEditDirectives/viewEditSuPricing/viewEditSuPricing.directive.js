angular.module('carli.viewEditDirectives.viewEditSuPricing')
    .directive('viewEditSuPricing', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditSuPricing/viewEditSuPricing.html',
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

function viewEditSuPricingController($scope){
    var vm = this;

    vm.addPriceRow = addPriceRow;

    activate();

    function activate() {
        vm.pricing = vm.pricing || [];
        sortPricing();
        $scope.$watch('vm.editMode', sortPricing);
    }

    function sortPricing() {
        if ( vm.pricing ){
            vm.pricing.sort(sortByUsers);
        }
    }

    function sortByUsers(a, b) {
        return a.users > b.users;
    }

    function addPriceRow(){
        vm.pricing.push({
            price: '',
            users: ''
        });
    }
}

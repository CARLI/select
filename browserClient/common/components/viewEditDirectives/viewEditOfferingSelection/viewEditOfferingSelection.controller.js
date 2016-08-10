angular.module('common.viewEditDirectives.viewEditOfferingSelection')
    .controller('viewEditOfferingSelectionController', viewEditOfferingSelectionController);

function viewEditOfferingSelectionController($scope, offeringService){
    var vm = this;

    activate();

    function activate() {
        vm.selectionOptions = makeSelectionOptions(vm.offering);
        $scope.$watchCollection('vm.offering.pricing', updateSelectionOptions);

        function updateSelectionOptions() {
            vm.selectionOptions = makeSelectionOptions(vm.offering);
        }
    }

    function makeSelectionOptions( offering ){
        if ( !offering ){
            return {};
        }

        var siteOption = {
            users: offeringService.siteLicenseSelectionUsers,
            price: offering.pricing.site
        };

        var suPrices = angular.copy(offering.pricing.su) || [];
        return suPrices.concat(siteOption);
    }
}


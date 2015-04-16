angular.module('carli.viewEditDirectives.viewEditOfferingSelection')
    .controller('viewEditOfferingSelectionController', viewEditOfferingSelectionController);

function viewEditOfferingSelectionController($scope){
    var vm = this;

    activate();

    function activate() {
        vm.selectionOptions = makeSelectionOptions(vm.offering);
        $scope.$watchCollection('vm.offering.pricing.su', function() {
            vm.selectionOptions = makeSelectionOptions(vm.offering);
        });
    }

    function makeSelectionOptions( offering ){
        if ( !offering ){
            return {};
        }

        var siteOption = {
            users: 'Site License',
            price: offering.pricing.site
        };

        var suPrices = offering.pricing.su || [];
        return suPrices.concat(siteOption);
    }
}


angular.module('library.unselectedProducts')
    .controller('unselectedProductsController', unselectedProductsController);

function unselectedProductsController($scope, cycleService, offeringService, productService){
    var vm = this;

    vm.loadingPromise = null;

    vm.getFundedSiteLicensePrice = getFundedSiteLicensePrice;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.isFunded = isFunded;
    vm.unselected = unselected;

    activate();

    function activate(){
        $scope.$watch('vm.cycle', cycleUpdated);
    }

    function cycleUpdated(newCycle){
        if ( newCycle ){
            loadUnselectedProductsForCycle();
        }
        else {
            hideUnselectedProductsModal();
        }
    }

    function loadUnselectedProductsForCycle(){
        vm.loadingPromise = loadOfferingsFor(vm.cycle);
        $('#unselected-products-modal').modal(true);
    }

    function hideUnselectedProductsModal(){
        $('#unselected-products-modal').modal('hide');
    }

    function loadOfferingsFor(cycle){
        return cycleService.listAllActiveOfferingsForCycle(cycle)
            .then(function(offeringsList){
                vm.offerings = offeringsList.filter(unselected);
            });
    }

    function hasSelection( offering ){
        return offering.selection;
    }

    function unselected( offering ){
        return !hasSelection( offering );
    }

    function isFunded(offering) {
        return offeringService.isFunded(offering);
    }
    function getFundedSiteLicensePrice(offering) {
        return offeringService.getFundedSiteLicensePrice(offering);
    }
}

angular.module('vendor.historicPricingModalContent')
    .controller('historicPricingModalContentController', historicPricingModalContentController);

function historicPricingModalContentController(offeringService){
    var vm = this;

    vm.classForCell = classForCell;
    vm.priceForCell = priceForCell;

    activate();

    function activate(){
        vm.thisYear = vm.cycle.year;
        vm.lastYear = vm.thisYear - 1;
    }

    function classForCell(productId, libraryId){
        var offering = vm.offerings[productId][libraryId];
        var result = '';

        if ( offering ) {
            if (offering.siteLicensePriceUpdated) {
                result += ' updated';
            }

            if (vendorHasUpdatedTheOfferingsPricing() && offeringService.getFlaggedState(offering, vm.cycle)) {
                result += ' flagged';
            }
        }

        return result.trim();

        function vendorHasUpdatedTheOfferingsPricing(){
            return offering.siteLicensePriceUpdated || offering.suPricesUpdated;
        }
    }

    function priceForCell(productId, libraryId, year){
        var offering = vm.offerings[productId][libraryId];

        if ( !offering ){
            return '';
        }
        else if ( year === vm.thisYear ){
            return offering.pricing.site;
        }
        else {
            var offeringHistory = offering.history || {};
            var offeringHistoryLastYear = offeringHistory[vm.lastYear] || {};
            var historicPricing = offeringHistoryLastYear.pricing || {};
            return historicPricing.site || '-';
        }
    }
}
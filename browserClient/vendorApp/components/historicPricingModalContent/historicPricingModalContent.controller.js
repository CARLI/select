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

            if (vendorHasUpdatedTheOfferingsPricing() && offeringIsFlaggedForSiteLicense()) {
                result += ' flagged';
            }
        }

        return result.trim();

        function vendorHasUpdatedTheOfferingsPricing(){
            return offering.siteLicensePriceUpdated;
        }

        function offeringIsFlaggedForSiteLicense() {
            var offeringReasonsApplicableToSiteLicensePricing = [];

            offeringService.getFlaggedState(offering, vm.cycle);
            if (offering.flaggedReason) {
                offeringReasonsApplicableToSiteLicensePricing = offering.flaggedReason.filter(applicableFlagReason);

            }
            return offeringReasonsApplicableToSiteLicensePricing.length > 0;
        }

        function applicableFlagReason(reason) {
            return reason.indexOf('One or more SU prices') < 0 && reason.indexOf('SU prices must') < 0;
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
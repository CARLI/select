angular.module('common.offeringService')
    .service('offeringService', offeringService);

function offeringService( CarliModules, $q, cycleService, errorHandler ) {

    var offeringModule = CarliModules.Offering;
    var productMiddleware = CarliModules.ProductMiddleware;

    var offeringDisplayLabels = {
        'with-price': 'Display with price',
        'without-price': 'Display without price',
        'none': 'Do not display'
    };

    return {
        list:   function() {
            return $q.when( offeringModule.list( cycleService.getCurrentCycle() ) )
                .catch(errorHandler);
        },
        create: function( offering, cycle ) {
            return $q.when( offeringModule.create(offering, cycle ? cycle : offering.cycle) );
        },
        update: function( offering ) {
            return $q.when( offeringModule.update(offering, cycleService.getCurrentCycle()) )
                .then(() => {
                    setSortableFlaggedStateOnOffering(offering, cycleService.getCurrentCycle());
                    return offering.id;
                });
        },
        load:   function( offeringId ) {
            return $q.when( offeringModule.load( offeringId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listOfferingsForLibraryId: function ( libraryId ) {
            return $q.when( offeringModule.listOfferingsForLibraryId( libraryId, cycleService.getCurrentCycle()) )
                .then(setSortableFlaggedStateOnOfferings)
                .catch(errorHandler);
        },
        listOfferingsForProductId: function ( productId ) {
            return $q.when( offeringModule.listOfferingsForProductId( productId, cycleService.getCurrentCycle()) )
                .then(setSortableFlaggedStateOnOfferings)
                .catch(errorHandler);
        },
        listOfferingsForVendorId: function ( vendorId ) {
            return $q.when( offeringModule.listOfferingsForVendorId( vendorId, cycleService.getCurrentCycle()) )
                .then(setSortableFlaggedStateOnOfferings)
                .catch(errorHandler);
        },
        isFunded: function( offering ) {
            return offeringModule.isFunded(offering);
        },
        getFullSelectionPrice: function( offering ) {
            return offeringModule.getFullSelectionPrice(offering);
        },
        getFundedSelectionPrice: function( offering ) {
            return offeringModule.getFundedSelectionPrice(offering);
        },
        getFundedSelectionPendingPrice: function( offering ) {
            return offeringModule.getFundedSelectionPendingPrice(offering);
        },
        getFundedSiteLicensePrice: function( offering ) {
            return offeringModule.getFundedSiteLicensePrice(offering);
        },
        getHistoricalFundedSiteLicensePrice: function( offering, year ) {
            return offeringModule.getHistoricalFundedSiteLicensePrice(offering, year);
        },
        getOneOfferingForProductId: function ( productId ) {
            return $q.when( offeringModule.listOfferingsForProductId( productId, cycleService.getCurrentCycle(), 1))
                .then(function(offerings){
                    return offerings[0];
                })
                .catch(errorHandler);
        },
        bulkUpdateOfferings: bulkUpdateOfferings,
        ensureProductHasOfferingsForAllLibraries: function ensureProductHasOfferingsForAllLibraries( product ){
            return $q.when( offeringModule.ensureProductHasOfferingsForAllLibraries( product.id, product.vendor.id, product.cycle ) );
        },
        createOfferingsFor: function createOfferingsFor( product, libraryIds ){
            return $q.when( offeringModule.createOfferingsFor( product.id, product.vendor.id, libraryIds, cycleService.getCurrentCycle()) );
        },
        updateSuPricingForAllLibrariesForProduct: function updateSuPricingForAllLibrariesForProduct( vendorId, productId, newSuPricing, vendorComments ){
            return $q.when( productMiddleware.updateSuPricingForProduct(vendorId, productId, newSuPricing, vendorComments, cycleService.getCurrentCycle()) );
        },
        updateSuCommentForAllLibrariesForProduct: function updateSuCommentForAllLibrariesForProduct(vendorId, productId, numSu, newCommentText) {
            return $q.when( productMiddleware.updateSuCommentForProduct(vendorId, productId, numSu, newCommentText, cycleService.getCurrentCycle()) );
        },
        getOfferingDisplayOptions: function() {
            var values = offeringModule.getOfferingDisplayOptions();
            var options = [];

            values.forEach(function(value) {
                options.push({
                    label: offeringDisplayLabels[value] || 'Unknown',
                    value: value
                });
            });
            return options;
        },
        getOfferingsById: function(ids) {
            return $q.when( offeringModule.getOfferingsById(ids,  cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        getOfferingDisplayLabels: function(){
            return offeringDisplayLabels;
        },
        getFlaggedState: getFlaggedState,
        removeSitePricing: function (offering) {
            return offeringModule.removeSitePricing(offering);
        },
        updateHistory: function (oldOffering, offering, year) {
            return offeringModule.updateHistory(oldOffering, offering, year);
        },
        populateNonCrmLibraryData: populateNonCrmLibraryData,
        siteLicenseSelectionUsers: offeringModule.siteLicenseSelectionUsers,
        clearFlagsForSelectedOfferings: function(selectedOfferings) {
            selectedOfferings.forEach(offering => offering.flagged = false);
            return bulkUpdateOfferings(selectedOfferings);
        }
    };

    function getFlaggedState (offering, optionalCycle) {
        return offeringModule.getFlaggedState(offering, optionalCycle);
    }

    function setSortableFlaggedStateOnOfferings (offerings) {
        return offerings.map(offering => setSortableFlaggedStateOnOffering(offering));
    }

    function setSortableFlaggedStateOnOffering(offering, optionalCycle) {
        const isOrangeFlag = getFlaggedState(offering, optionalCycle) && !offering.flagged;
        const isPurpleFlag = offering.flagged === true;
        const isHollowPurpleFlag = offering.flagged === false;
        if(isOrangeFlag)
            offering.sortableFlaggedState = 0;
        else if(isPurpleFlag)
            offering.sortableFlaggedState = 1;
        else if(isHollowPurpleFlag)
            offering.sortableFlaggedState = 3;
        else
            offering.sortableFlaggedState = 2;

        return offering;
    }

    function populateNonCrmLibraryData(offerings, libraryLoadingPromise) {
        var librariesByCrmId = {};

        return groupLibrariesByCrmId()
            .then(copyLibrariesToOfferings);

        function groupLibrariesByCrmId() {
            return libraryLoadingPromise.then(function (libraries) {
                libraries.forEach(function (l) {
                    librariesByCrmId[l.crmId] = l;
                });
                return true;
            });
        }

        function copyLibrariesToOfferings() {
            return offerings.map(function (offering) {
                offering.library = librariesByCrmId[offering.library.id];
                return offering;
            });
        }
    }

    function bulkUpdateOfferings( listOfOfferings, cycle ){
        var cycleToUse = cycle || cycleService.getCurrentCycle();
        return $q.when( offeringModule.bulkUpdateOfferings( listOfOfferings, cycleToUse ));
    }

}

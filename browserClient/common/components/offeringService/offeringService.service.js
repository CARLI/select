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
        create: function( offering ) {
            return $q.when( offeringModule.create(offering, offering.cycle) );
        },
        update: function( offering ) {
            return $q.when( offeringModule.update(offering, cycleService.getCurrentCycle()) );
        },
        load:   function( offeringId ) {
            return $q.when( offeringModule.load( offeringId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listOfferingsForLibraryId: function ( libraryId ) {
            return $q.when( offeringModule.listOfferingsForLibraryId( libraryId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listOfferingsForProductId: function ( productId ) {
            return $q.when( offeringModule.listOfferingsForProductId( productId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listOfferingsForVendorId: function ( vendorId ) {
            return $q.when( offeringModule.listOfferingsForVendorId( vendorId, cycleService.getCurrentCycle()) )
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
        bulkUpdateOfferings: function( listOfOfferings, cycle ){
            var cycleToUse = cycle || cycleService.getCurrentCycle();
            return $q.when( offeringModule.bulkUpdateOfferings( listOfOfferings, cycleToUse ));
        },
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
        updateSiteLicensePricingForVendorProducts: function updateSiteLicensePricingForVendorProducts(vendorId, cycle, listOfVendorSiteLicensePrices) {
            return $q.when(productMiddleware.updateSiteLicensePricingForProducts(vendorId, cycle, listOfVendorSiteLicensePrices));
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
        getFlaggedState: function (offering, optionalCycle) {
            return offeringModule.getFlaggedState(offering, optionalCycle);
        },
        removeSitePricing: function (offering) {
            return offeringModule.removeSitePricing(offering);
        },
        updateHistory: function (oldOffering, offering, year) {
            return offeringModule.updateHistory(oldOffering, offering, year);
        },
        populateNonCrmLibraryData: populateNonCrmLibraryData,
        siteLicenseSelectionUsers: offeringModule.siteLicenseSelectionUsers
    };

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


}

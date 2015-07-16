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
        updateSuPricingForAllLibrariesForProduct: function updateSuPricingForAllLibrariesForProduct( vendorId, productId, newSuPricing ){
            return $q.when( productMiddleware.updateSuPricingForProduct(vendorId, productId, newSuPricing, cycleService.getCurrentCycle()) );
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
        }
    };
}

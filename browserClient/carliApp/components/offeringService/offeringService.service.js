angular.module('carli.offeringService')
    .service('offeringService', offeringService);

function offeringService( CarliModules, $q, cycleService ) {

    var offeringModule = CarliModules.Offering;

    var offeringDisplayLabels = {
        'with-price': 'Display with price',
        'without-price': 'Display without price',
        'none': 'Do not display'
    };

    return {
        list:   function() {
            return $q.when( offeringModule.list( cycleService.getCurrentCycle() ) );
        },
        create: function( offering ) {
            return $q.when( offeringModule.create(offering, cycleService.getCurrentCycle()) );
        },
        update: function( offering ) {
            return $q.when( offeringModule.update(offering, cycleService.getCurrentCycle()) );
        },
        load:   function( offeringId ) {
            return $q.when( offeringModule.load( offeringId, cycleService.getCurrentCycle()) );
        },
        listOfferingsForLibraryId: function ( libraryId ) {
            return $q.when( offeringModule.listOfferingsForLibraryId( libraryId, cycleService.getCurrentCycle()) );
        },
        listOfferingsForProductId: function ( productId ) {
            return $q.when( offeringModule.listOfferingsForProductId( productId, cycleService.getCurrentCycle()) );
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
            return $q.when( offeringModule.getOfferingsById(ids,  cycleService.getCurrentCycle()) );
        },
        getOfferingDisplayLabels: function(){
            return offeringDisplayLabels;
        },
        getFlaggedState: function (offering) {
            return offeringModule.getFlaggedState(offering);
        }
    };
}

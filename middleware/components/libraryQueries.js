var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');

var Q = require('q');

/* This function exists to facilitate listing the selections for a library on their dashboard.
 * Since there are multiple cycles shown, there were issues with making all the requests from the browser.
 * The offering repository was getting mixed up and trying to load products from the wrong cycle.
 *
 * Do all the requests here, and also load all the Vendors for the Products that are in the Offerings.
 * (i.e. load the entities two-layers deep for the Offerings)
 */
function listSelectionsForLibraryFromCycle( libraryId, cycleId ){
    var cycle = null;

    return cycleRepository.load(cycleId)
        .then(function(loadedCycle){
            cycle = loadedCycle;
            console.log('listSelectionsForLibrary '+libraryId+' FromCycle '+cycle.name);
            return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
        })
        .then(populateProductsForOfferings)
        .catch(function(err){
            console.log('Error listing selections for library '+libraryId+' from cycle '+cycle.name, err);
        });

    function populateProductsForOfferings( offeringsList ){
        return Q.all(offeringsList.map(loadProduct));

        function loadProduct(offering){
            return productRepository.load(offering.product.id, cycle)
                .then(function(product){
                    offering.product = product;
                    return offering;
                });
        }
    }
}

module.exports = {
    listSelectionsForLibraryFromCycle: listSelectionsForLibraryFromCycle
};

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
    console.log('listSelectionsForLibraryFromCycle('+libraryId+', '+cycleId+')');
    var cycle = null;

    return cycleRepository.load(cycleId)
        .then(function(loadedCycle){
            cycle = loadedCycle;
            return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
        })
        .then(populateProductsForOfferings)
        .catch(function(err){
            console.log('Error listing selections for library '+libraryId+' from cycle '+cycle.name, err);
        });

    function populateProductsForOfferings( offeringsList ){
        return Q.all(offeringsList.map(loadProduct));

        function loadProduct(offering){
            return productRepository.load(productId(), cycle)
                .then(function(product){
                    offering.product = product;
                    return offering;
                })
                .catch(function(err){
                    console.log('error expanding product '+err.message);
                });

            function productId(){
                return typeof offering.product === 'string' ? offering.product : offering.product.id;
            }

        }
    }
}

/* Used by the selection screens in the library app. They need all of their offerings plus vendor and license info from
 * the Products for each offering.
 * Load all of that in the middleware to prevent the browser from doing too many requests.
 */
function listOfferingsForLibraryWithExpandedProducts( libraryId, cycleId ){
    var cycle = null;

    return cycleRepository.load(cycleId)
        .then(function(loadedCycle){
            cycle = loadedCycle;
            return offeringRepository.listOfferingsForLibraryId(libraryId, cycle);
        })
        .then(populateProductsForOfferings)
        .catch(function(err){
            console.log('  ** Error populating products', err);
        });

    function populateProductsForOfferings( offeringsList ){
        return Q.all(offeringsList.map(loadProduct));

        function loadProduct(offering){
            return productRepository.load(productId(), cycle)
                .then(function(product){
                    offering.product = product;
                    return offering;
                })
                .catch(function(err){
                    console.log('    error expanding product '+err.message);
                });

            function productId(){
                return typeof offering.product === 'string' ? offering.product : offering.product.id;
            }
        }
    }
}

function getHistoricalSelectionDataForLibraryForProduct( libraryId, productId, cycleId ){
    var selectionsByYear = {};

    return cycleRepository.load(cycleId)
        .then(function(currentCycle){
            return cycleRepository.listPastFourCyclesMatchingCycle(currentCycle)
                .then(function(cycleList){
                    return cycleList.concat(currentCycle);
                });
        })
        .then(getSelectionDataForCycles)
        .thenResolve(selectionsByYear)
        .catch(function(err){
            console.log('Error getting historical selections for library '+libraryId+' from cycle '+cycle.name, err);
        });

    function getSelectionDataForCycles( cycles ){
        return Q.all( cycles.map(getSelectionDataForCycle) );

        function getSelectionDataForCycle(cycle){
            return offeringRepository.listOfferingsForProductIdUnexpanded( productId, cycle )
                .then(returnWhetherLibrarySelectedProductInCycle)
                .catch(function(err){
                    console.log('Error getting selection data for '+cycle.name, err);
                });

            function returnWhetherLibrarySelectedProductInCycle(offeringsForProductFromCycle){
                var offering = offeringsForProductFromCycle.filter(offeringForLibrary)[0] || null;
                var selected = !!(offering && offering.selection);
                selectionsByYear[cycle.year] = selected;
                console.log('results from '+cycle.name+':'+selected);
                return selected;
            }
        }
    }

    function offeringForLibrary( offering ){
        return offering.library == libraryId;
    }
}

module.exports = {
    listSelectionsForLibraryFromCycle: listSelectionsForLibraryFromCycle,
    listOfferingsForLibraryWithExpandedProducts: listOfferingsForLibraryWithExpandedProducts,
    getHistoricalSelectionDataForLibraryForProduct: getHistoricalSelectionDataForLibraryForProduct
};

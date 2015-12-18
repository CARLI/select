var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var licenseRepository = require('../../CARLI/Entity/LicenseRepository');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository');

var Q = require('q');

/* This function exists to facilitate listing the selections for a library on their dashboard.
 * Since there are multiple cycles shown, there were issues with making all the requests from the browser.
 * The offering repository was getting mixed up and trying to load products from the wrong cycle.
 *
 * Do all the requests here, and also load all the Vendors and Licenses for the Products that are in the Offerings.
 * (i.e. load the entities two-layers deep for the Offerings)
 */
function listSelectionsForLibraryFromCycle( libraryId, cycleId ){
    Logger.log('listSelectionsForLibraryFromCycle('+libraryId+', '+cycleId+')');
    var cycle = null;

    return cycleRepository.load(cycleId)
        .then(function(loadedCycle){
            cycle = loadedCycle;
            return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
        })
        .catch(function(err){
            Logger.log('Error 1 listing selections for library '+libraryId+' from cycle '+cycle.name, err.stack);
            Logger.log(err);
            throw new Error('Error listing selections from ' + cycle.name);
        })
        .then(populateProductsForOfferings)
        .catch(function(err){
            Logger.log('Error 2 listing selections for library '+libraryId+' from cycle '+cycle.name, err.stack);
            Logger.log(err);
            throw new Error('Error listing selections from ' + cycle.name);
        });

    function populateProductsForOfferings( offeringsList ){
        return getProductIds(offeringsList)
            .then(loadProductsById)
            .then(mapProductsById)
            .then(replaceProductIdsWithProducts)
            .then(getVendorIdsFromProductObjects)
            .then(vendorRepository.getVendorsById)
            .then(mapVendorsById)
            .then(replaceVendorIdsWithVendorObjects)
            .then(getLicenseIdsFromProductObjects)
            .then(licenseRepository.getLicensesById)
            .then(mapLicensesById)
            .then(replaceLicenseIdsWithLicenseObjects)
            .thenResolve(offeringsList);

        function getProductIds(listOfOfferings){
            return Q(listOfOfferings.map(getProductId));
        }

        function loadProductsById(productIds){
            return productRepository.getProductsById(productIds, cycle);
        }

        function mapProductsById(listOfProducts){
            var results = {};

            listOfProducts.forEach(function(product){
                results[product.id] = product;
            });

            return results;
        }

        function replaceProductIdsWithProducts(productMap){
            return offeringsList.map(replaceOfferingProduct);

            function replaceOfferingProduct(offering){
                var productId = getProductId(offering);
                offering.product = productMap[productId];
                return offering;
            }
        }

        function getVendorIdsFromProductObjects(listOfOfferings){
            return listOfOfferings.map(getVendorId);

            function getVendorId(offering){
                return offering.product.vendor;
            }
        }

        function mapVendorsById(listOfVendors){
            var results = {};

            listOfVendors.forEach(function(vendor){
                results[vendor.id] = vendor;
            });

            return results;
        }

        function replaceVendorIdsWithVendorObjects(vendorMap){
            return offeringsList.map(replaceOfferingProductVendor);

            function replaceOfferingProductVendor(offering){
                offering.product.vendor = vendorMap[offering.product.vendor];
                return offering;
            }
        }

        function getLicenseIdsFromProductObjects(listOfOfferings){
            return listOfOfferings.map(getLicenseId);

            function getLicenseId(offering){
                return offering.product.license;
            }
        }

        function mapLicensesById(listOfLicenses){
            var results = {};

            listOfLicenses.forEach(function(license){
                if ( license ) {
                    results[license.id] = license;
                }
            });

            return results;
        }

        function replaceLicenseIdsWithLicenseObjects(licenseMap){
            return offeringsList.map(replaceOfferingProductLicense);

            function replaceOfferingProductLicense(offering){
                offering.product.license = licenseMap[offering.product.license];
                return offering;
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
            Logger.log('  ** Error populating products', err);
            throw new Error('Error loading data for ' + cycle.name);
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
                    Logger.log('    error expanding product '+err.message);
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
            Logger.log('Error getting historical selections for library '+libraryId+' from cycle '+cycleId, err);
            throw err;
        });

    function getSelectionDataForCycles( cycles ){
        return Q.all( cycles.map(getSelectionDataForCycle) );

        function getSelectionDataForCycle(cycle){
            return offeringRepository.listOfferingsForProductIdUnexpanded( productId, cycle )
                .then(returnWhetherLibrarySelectedProductInCycle)
                .catch(function(err){
                    Logger.log('Error getting selection data for '+cycle.name, err);
                    throw new Error('Error loading data for ' + cycle.name);
                });

            function returnWhetherLibrarySelectedProductInCycle(offeringsForProductFromCycle){
                var offering = offeringsForProductFromCycle.filter(offeringForLibrary)[0] || null;
                var selected = !!(offering && offering.selection);
                selectionsByYear[cycle.year] = selected;
                Logger.log('results from '+cycle.name+':'+selected);
                return selected;
            }
        }
    }

    function offeringForLibrary( offering ){
        return offering.library == libraryId;
    }
}

function getProductId(offering){
    return typeof offering.product === 'string' ? offering.product : offering.product.id;
}

module.exports = {
    listSelectionsForLibraryFromCycle: listSelectionsForLibraryFromCycle,
    listOfferingsForLibraryWithExpandedProducts: listOfferingsForLibraryWithExpandedProducts,
    getHistoricalSelectionDataForLibraryForProduct: getHistoricalSelectionDataForLibraryForProduct
};

var moment = require('moment');
var Q = require('q');

var config = require('../../config');
var couchUtils = require('../Store/CouchDb/Utils')();
var CycleRepository = require('./CycleRepository');
var Entity = require('../Entity');
var EntityTransform = require('./EntityTransformationUtils');
var getStoreForCycle = require('./getStoreForCycle');
var Validator = require('../Validator');
const vendorDatabaseName = require("./vendorDatabaseName");

var ProductRepository = Entity('Product');
var storeOptions = {};

var propertiesToTransform = ['cycle', 'vendor', 'license'];

function transformFunction(product) {
    EntityTransform.transformObjectForPersistence(product, propertiesToTransform);
}

function expandProducts(listPromise, cycle) {
    return EntityTransform.expandListOfObjectsFromPersistence(listPromise, propertiesToTransform, functionsToAdd);
}

function createProduct(product, cycle) {
    setCycle(cycle);
    return ProductRepository.create(product, transformFunction);
}

function updateProduct(product, cycle) {
    setCycle(cycle);
    return ProductRepository.update(product, transformFunction);
}

function listProducts(cycle) {
    setCycle(cycle);
    return expandProducts(ProductRepository.list(cycle.getDatabaseName()), cycle);
}

function loadProduct(productId, cycle) {
    var deferred = Q.defer();

    setCycle(cycle);
    ProductRepository.load(productId)
        .then(function (product) {
            EntityTransform.expandObjectFromPersistence(product, propertiesToTransform, functionsToAdd)
                .then(function () {
                    deferred.resolve(product);
                })
                .catch(function (err) {
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database to either vendor or license in product ', err);
                    deferred.resolve(product);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listProductsUnexpanded(cycle) {
    setCycle(cycle);
    return ProductRepository.list(cycle.getDatabaseName());
}

function listActiveProductsUnexpanded(cycle) {
    setCycle(cycle);
    return ProductRepository.list(cycle.getDatabaseName())
        .then(function (productList) {
            return productList.filter(function (product) {
                return product.isActive;
            });
        });
}

function listAvailableOneTimePurchaseProducts() {
    var deferred = Q.defer();

    CycleRepository.load(config.oneTimePurchaseProductsCycleDocId).then(function (cycle) {
        listProducts(cycle)
            .then(function (allProducts) {
                var p = allProducts
                    .filter(isActive)
                    .filter(isAvailableToday);
                deferred.resolve(p);
            })
            .catch(function (err) {
                deferred.reject(err);
            });
    });

    return deferred.promise;
}

function isActive(product) {
    return product.getIsActive();
}

function isAvailableToday(product) {
    var throughDate = moment(product.oneTimePurchase.availableForPurchaseThrough);
    var lastMidnight = moment().startOf('day');
    return throughDate.isAfter(lastMidnight);
}

function listProductsForLicenseId(licenseId, cycle) {
    setCycle(cycle);
    return expandProducts(couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listProductsByLicenseId', licenseId), cycle);
}

function listProductsForVendorId(vendorId, cycle) {
    setCycle(cycle);
    return expandProducts(couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listProductsForVendorId', vendorId), cycle);
}

function listActiveProductIdsForVendorIds(listOfVendorIds, cycle) {
    setCycle(cycle);
    return Q.all(listOfVendorIds.map(getActiveProductIdsForVendor));

    function getActiveProductIdsForVendor(vendorId) {
        return couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listProductsForVendorId', vendorId)
            .then(returnActiveProductIds);
    }

    function returnActiveProductIds(listOfProducts) {
        return listOfProducts.filter(isActive).map(getId);
    }

    function isActive(product) {
        return product.isActive;
    }

    function getId(product) {
        return product.id;
    }
}

function listActiveProductsForVendorId(vendorId, cycle) {
    return listProductsForVendorId(vendorId, cycle)
        .then(filterActiveProducts);

    function filterActiveProducts(productList) {
        return productList.filter(function (product) {
            return product.getIsActive();
        });
    }
}

function getPriceCapsForProducts(vendorId, cycle) {
    const vendorDbName = cycle.getDatabaseName();

    return couchUtils.getCouchViewResultValues(vendorDbName, 'listPriceCapsForProducts');
}

function listProductCountsByVendorId(cycle) {
    setCycle(cycle);
    return couchUtils.getCouchViewResultObject(cycle.getDatabaseName(), 'listProductCountsByVendorId', null, true);
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    setStore(getStoreForCycle(cycle, storeOptions));
}

function getProductsById(ids, cycle) {
    return couchUtils.getCouchDocuments(cycle.getDatabaseName(), ids);
}

function getProductSelectionStatisticsForCycle(productId, cycle) {
    if (!productId) {
        return Q.reject('getProductSelectionStatisticsForCycle: product Id required');
    }

    if (!cycle || !cycle.getDatabaseName) {
        return Q.reject('getProductSelectionStatisticsForCycle: fully expanded cycle required');
    }

    return couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsForProductId', productId)
        .then(function (offerings) {
            return {
                numberOffered: offerings.length,
                numberSelected: offerings.filter(selected).length,
                minPrice: minPrice(offerings),
                maxPrice: maxPrice(offerings),
                funded: isAnyOfferingFunded(offerings)
            };
        });

    function selected(offering) {
        return offering.selection;
    }

    function minPrice(offeringsList) {
        var minPriceSoFar = Infinity;

        offeringsList.forEach(function (offering) {
            if (offering.pricing) {
                var minSuPrice = offering.pricing.su ? findMinSuPrice(offering.pricing.su) : Infinity;
                var minPriceForOffering = Math.min(minSuPrice, offering.pricing.site);

                if (minPriceForOffering < minPriceSoFar) {
                    minPriceSoFar = minPriceForOffering;
                }
            }
        });

        return minPriceSoFar;
    }

    function maxPrice(offeringsList) {
        var maxPriceSoFar = 0;

        offeringsList.forEach(function (offering) {
            if (offering.pricing) {
                var maxSuPrice = offering.pricing.su ? findMaxSuPrice(offering.pricing.su) : 0;
                var maxPriceForOffering = Math.max(maxSuPrice, offering.pricing.site);

                if (maxPriceForOffering > maxPriceSoFar) {
                    maxPriceSoFar = maxPriceForOffering;
                }
            }
        });

        return maxPriceSoFar;
    }

    function isAnyOfferingFunded(offerings) {
        return offerings.reduce(anyOfferingIsFundedReduction, false);

        function anyOfferingIsFundedReduction(anyOfferingIsFunded, offering) {
            return anyOfferingIsFunded || isOfferingFunded(offering);
        }

        function isOfferingFunded(offering) {
            if (offering.funding) {
                if (offering.funding.fundedByPercentage) {
                    return offering.funding.fundedPercent > 0;
                } else {
                    return offering.funding.fundedPrice > 0;
                }
            }
            return false;
        }
    }

    function findMinSuPrice(listOfSuPricingObjects) {
        var minSuPrice = Infinity;

        listOfSuPricingObjects.forEach(function (suPricing) {
            if (suPricing.price < minSuPrice) {
                minSuPrice = suPricing.price;
            }
        });

        return minSuPrice;
    }

    function findMaxSuPrice(listOfSuPricingObjects) {
        var maxSuPrice = 0;

        listOfSuPricingObjects.forEach(function (suPricing) {
            if (suPricing.price > maxSuPrice) {
                maxSuPrice = suPricing.price;
            }
        });

        return maxSuPrice;
    }
}

function transformProductsForNewCycle(cycle) {
    setCycle(cycle);
    return listProducts(cycle)
        .then(setCycleOnProducts)
        .then(copyPriceCaps)
        .then(removeVendorComments)
        .then(prepareProductsToBeSaved)
        .then(saveProducts)
        .then(function () {
            return {ok: true};
        });


    function setCycleOnProducts(products) {
        return products.map((product) => {
            product.cycle = cycle;
            return product;
        });
    }

    function copyPriceCaps(products) {
        return products.map(copyPriceCapForProduct);

        function copyPriceCapForProduct(product) {
            if (product.futurePriceCaps && product.futurePriceCaps[cycle.year]) {
                product.priceCap = product.futurePriceCaps[cycle.year];
                delete product.futurePriceCaps[cycle.year];
            }
            return product;
        }
    }

    function removeVendorComments(products) {
        return products.map(removeVendorCommentsFromProduct);

        function removeVendorCommentsFromProduct(product) {
            product.comments = '';
            return product;
        }
    }

    function prepareProductsToBeSaved(products) {
        return products.map(unexpandProduct);

        function unexpandProduct(p) {
            unexpandProperty(p, 'vendor');
            unexpandProperty(p, 'cycle');
            unexpandProperty(p, 'license');
            // p.vendor = p.vendor.id;
            // p.cycle = p.cycle.id;
            // if (p.license)
            //     p.license = p.license.id;

            return p;
        }

        function unexpandProperty(product, prop) {
            if (productPropertyNeedsUnexpanded(product, prop)) {
                product[prop] = product[prop].id;
            }
        }

        function productPropertyNeedsUnexpanded(product, prop) {
            return product.hasOwnProperty(prop) && product[prop] && typeof product[prop] !== 'string' && product[prop].hasOwnProperty('id');
        }
    }

    function saveProducts(products) {
        return couchUtils.bulkUpdateDocuments(cycle.getDatabaseName(), products);
    }
}

/* functions that get added as instance methods on loaded Products */
var getIsActive = function () {
    return isProductActive(this);
};

function isProductActive(product) {
    var vendorIsActive = true;
    var licenseIsActive = true;

    if (product.vendor && product.vendor.isActive != undefined) {
        vendorIsActive = product.vendor.isActive;
    }

    if (product.license && product.license.isActive != undefined) {
        licenseIsActive = product.license.isActive;
    }

    return product.isActive && vendorIsActive && licenseIsActive;
}

var functionsToAdd = {
    'getIsActive': getIsActive
};

function getProductDetailCodeOptions() {
    return Validator.getEnumValuesFor('ProductDetailCodes');
}

function listActiveProductsFromActiveCycles() {
    var consolidatedProductsById = {};

    return CycleRepository.listActiveCycles()
        .then(sortCyclesByYear)
        .then(listProductsForAllCycles)
        .then(returnConsolidatedProductList);

    function listProductsForAllCycles(cycles) {
        var productPromises = [];

        cycles.forEach(listProductsFromCycle);

        return Q.all(productPromises);

        function listProductsFromCycle(cycle) {
            var listProductsPromise = listProducts(cycle)
                .then(filterActiveProducts)
                .then(addToProductList);
            productPromises.push(listProductsPromise);

            function addToProductList(activeProducts) {
                activeProducts.forEach(function (product) {
                    if (!consolidatedProductsById.hasOwnProperty(product.id)) {
                        consolidatedProductsById[product.id] = product;
                    }
                });
                return activeProducts;
            }
        }
    }

    function returnConsolidatedProductList() {
        var products = [];

        Object.keys(consolidatedProductsById).forEach(function (productId) {
            products.push(consolidatedProductsById[productId]);
        });

        return sortArrayOfObjectsByKeyAscending(products, 'name');
    }
}

function filterActiveProducts(products) {
    return products.filter(function (product) {
        return product.getIsActive();
    });
}

function setStore(store) {
    storeOptions = store.getOptions();
    ProductRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(storeOptions);
    // EntityTransform.setEntityLookupStores(store);
}

function sortCyclesByYear(cycles) {
    return sortArrayOfObjectsByKeyDescending(cycles, 'year');
}

function sortArrayOfObjectsByKeyAscending(arr, key) {
    return arr.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortArrayOfObjectsByKeyDescending(arr, key) {
    return arr.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return -1 * ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


module.exports = {
    setStore: setStore,
    setCycle: setCycle,
    create: createProduct,
    update: updateProduct,
    list: listProducts,
    load: loadProduct,
    listActiveProductsUnexpanded: listActiveProductsUnexpanded,
    listProductsUnexpanded: listProductsUnexpanded,
    listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts,
    listProductsForLicenseId: listProductsForLicenseId,
    listProductsForVendorId: listProductsForVendorId,
    listActiveProductIdsForVendorIds: listActiveProductIdsForVendorIds,
    listActiveProductsForVendorId: listActiveProductsForVendorId,
    listProductCountsByVendorId: listProductCountsByVendorId,
    listActiveProductsFromActiveCycles: listActiveProductsFromActiveCycles,
    getProductsById: getProductsById,
    getProductDetailCodeOptions: getProductDetailCodeOptions,
    isProductActive: isProductActive,
    getProductSelectionStatisticsForCycle: getProductSelectionStatisticsForCycle,
    transformProductsForNewCycle: transformProductsForNewCycle,
    getPriceCapsForProducts: getPriceCapsForProducts
};

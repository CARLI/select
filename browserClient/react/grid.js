const store = {
    libraries: [],
    products: [],
    offeringHash: {}
};

export function setLibrariesAndProducts(libraries, products) {
    Object.assign(store, {
        libraries: libraries,
        products: products,
        offeringHash: makeOfferingHash(libraries, products)
    });
}

export function getKeyForLibraryAndProduct(library, product) {
    return `library-${library.crmId}-product-${product.id}`;
}

export function getOfferingHash() {
    return store.offeringHash;
}

export function getOffering(library, product) {
    return store.offeringHash[getKeyForLibraryAndProduct(library, product)];
}

export function updateSiteLicensePrice(library, product, newPrice) {
    store.offeringHash[getKeyForLibraryAndProduct(library, product)].updatedPrice = newPrice;
}

function makeOfferingHash(libraries, products) {
    const offeringHash = {};

    libraries.forEach(l => {
        products.forEach(p => {
            offeringHash[getKeyForLibraryAndProduct(l, p)] = {
                originalPrice: getSiteLicensePriceForLibraryAndProduct(l, p),
                updatedPrice: null
            };
        });
    });

    return offeringHash;
}

function getSiteLicensePriceForLibraryAndProduct(library, product) {
    return product.offerings.reduce((current, next) => {
        return next.library === library.crmId ? next.pricing.site : current;
    }, 0);
}
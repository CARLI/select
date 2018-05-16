const INITIAL_STATE = {
    offeringHash: {},
    libraries: [],
    products: []
};

export const ActionTypes = {
    SetCycle: 'setCycle',
    SetLibrariesAndProducts: 'setLibrariesAndProducts',
    SetProducts: 'setProducts'
};

export function reducer(state = INITIAL_STATE, action = null) {
    if (!action)
        return state;

    if (action.type === ActionTypes.SetCycle)
        return setCycle(state, action.args);

    if (action.type === ActionTypes.SetLibrariesAndProducts)
        return setLibrariesAndProducts(state, action.args);

    return state;
}

function setCycle(state, args) {
    return Object.assign({}, state, { cycle: args.cycle });
}

function setLibrariesAndProducts(state, args) {
    return Object.assign({}, state, {
        libraries: args.libraries,
        products: args.products,
        offeringHash: makeOfferingHash(args.libraries, args.products)
    });
}

function makeOfferingHash(libraries, products) {
    const offeringHash = {};

    libraries.forEach(l => {
        products.forEach(p => {
            offeringHash[getKeyForLibraryAndProduct(l, p)] = {
                siteLicensePrice: getSiteLicensePriceForLibraryAndProduct(l, p)
            };
        });
    });

    return offeringHash;
}

export function getKeyForLibraryAndProduct(library, product) {
    return `library-${library.crmId}-product-${product.id}`;
}

function getSiteLicensePriceForLibraryAndProduct(library, product) {
    return product.offerings.reduce((current, next) => {
        return next.library === library.crmId ? next.pricing.site : current;
    }, 0);
}
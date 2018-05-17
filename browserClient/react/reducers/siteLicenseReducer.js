const INITIAL_STATE = {
    offeringHash: {},
    libraries: [],
    products: [],
    cellInEditMode: {
        library: null,
        product: null
    }
};

export const ActionTypes = {
    SetCycle: 'setCycle',
    SetLibrariesAndProducts: 'setLibrariesAndProducts',
    SetProducts: 'setProducts',
    SetSiteLicensePrice: 'setSiteLicensePrice'
};

export function reducer(state = INITIAL_STATE, action = null) {
    if (!action)
        return state;

    if (action.type === ActionTypes.SetCycle)
        return setCycle(state, action.args);

    if (action.type === ActionTypes.SetLibrariesAndProducts)
        return setLibrariesAndProducts(state, action.args);

    if (action.type === ActionTypes.SetSiteLicensePrice)
        return setSiteLicensePrice(state, action.args);

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

function setSiteLicensePrice(state, args) {
    const key = getKeyForLibraryAndProduct(args.library, args.product);
    const offering = state.offeringHash[key];

    const currentPrice = offering.siteLicensePrice;
    if (args.siteLicensePrice === currentPrice)
        return state;

    const newOfferingHash = Object.assign({}, state.offeringHash, {
        [key]: Object.assign({}, offering, { siteLicensePrice: args.siteLicensePrice})
    });

    return Object.assign({}, state, {
        offeringHash: newOfferingHash
    });
}
import {expect} from 'chai';
import {reducer, ActionTypes, getKeyForLibraryAndProduct} from './siteLicenseReducer';
import {createStore} from 'redux';
import deepFreeze from 'deep-freeze';

function freshStore() {
    return createStore(reducer);
}

function freshStoreWithLibrariesAndProducts() {
    const store = freshStore();
    const state = store.getState();
    deepFreeze(state);

    const libraries = getTestLibraries();
    const products = getTestProducts();

    store.dispatch({
        type: ActionTypes.SetLibrariesAndProducts,
        args: {libraries, products}
    });

    return store;
}

function getTestLibraries() {
    return [
        {
            type: "Library",
            crmId: "3",
            name: "Augustana College",
            institutionYears: "4 Year",
            institutionType: "Private",
            membershipLevel: "Governing"
        },
        {
            type: "Library",
            crmId: "4",
            name: "Aurora University",
            institutionYears: "4 Year",
            institutionType: "Private",
            membershipLevel: "Governing"
        },
        {
            type: "Library",
            crmId: "11",
            name: "Catholic Theological Union",
            institutionYears: "4 Year",
            institutionType: "Private",
            membershipLevel: "Governing"
        }
    ];
}

function getTestProducts() {
    return [
        {
            name: "Essentials Collections: Religion",
            offerings: [
                {
                    "library": "11",
                    "pricing": {
                        "site": 2258,
                        "su": []
                    },
                    "type": "Offering"
                },
                {
                    "library": "4",
                    "pricing": {
                        "site": 2258,
                        "su": []
                    },
                    "type": "Offering"
                },
                {
                    "library": "3",
                    "pricing": {
                        "site": 2258,
                        "su": []
                    },
                    "type": "Offering"
                }
            ],
            id: "003083ed-4b09-47b8-a9f5-d6195b13c001",
            type: "Product"
        },
        {
            name: "Education Abstracts",
            offerings: [
                {
                    "library": "3",
                    "pricing": {
                        "site": 2068,
                        "su": []
                    },
                    "type": "Offering"
                },
                {
                    "library": "11",
                    "pricing": {
                        "site": 2068,
                        "su": []
                    },
                    "type": "Offering"
                }, {
                    "library": "4",
                    "pricing": {
                        "site": 2068,
                        "su": []
                    },
                    "type": "Offering"
                }
            ],
            id: "1279f5ee-4469-49af-b10a-f6b89ccb65c6",
            type: "Product"
        }
    ];
}

describe('siteLicenseReducer', function () {
    it('should exist', function () {
        expect(reducer).to.be.a('function');
    });

    describe('SetCycle action', function () {
        it('should set the cycle', function () {
            const store = freshStore();
            const state = store.getState();
            deepFreeze(state);

            const cycle = {
                id: 'foo'
            };

            store.dispatch({
                type: ActionTypes.SetCycle,
                args: {cycle}
            });

            expect(store.getState().cycle).to.deep.equal(cycle);
        });
    });

    describe('SetLibrariesAndProducts action', function () {
        it('should set the libraries and products', function () {
            const store = freshStoreWithLibrariesAndProducts();

            const libraries = getTestLibraries();
            const products = getTestProducts();

            expect(store.getState().libraries).to.deep.equal(libraries);
            expect(store.getState().products).to.deep.equal(products);
        });

        it('should create the offering hash with keys ', function () {
            const store = freshStoreWithLibrariesAndProducts();

            const keys = Object.keys(store.getState().offeringHash);
            const expectedKeys = [
                'library-3-product-003083ed-4b09-47b8-a9f5-d6195b13c001',
                'library-3-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6',
                'library-4-product-003083ed-4b09-47b8-a9f5-d6195b13c001',
                'library-4-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6',
                'library-11-product-003083ed-4b09-47b8-a9f5-d6195b13c001',
                'library-11-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6'
            ];

            expect(keys.sort()).to.deep.equal(expectedKeys.sort());
        });

        it('should create the offering hash with the site license price', function () {
            const store = freshStoreWithLibrariesAndProducts();

            const offeringHash = store.getState().offeringHash;

            expect(offeringHash['library-3-product-003083ed-4b09-47b8-a9f5-d6195b13c001'].siteLicensePrice).to.equal(2258);
            expect(offeringHash['library-11-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6'].siteLicensePrice).to.equal(2068);
        });
    });

    describe('SetSiteLicensePrice action', function () {
        it('should set the value for the given library and product', function () {
            const store = freshStoreWithLibrariesAndProducts();

            const library = store.getState().libraries.find(l => l.crmId === '4');
            const product = store.getState().products.find(p => p.id === "003083ed-4b09-47b8-a9f5-d6195b13c001");

            store.dispatch({
                type: ActionTypes.SetSiteLicensePrice,
                args: { library, product, siteLicensePrice: 666 }
            });

            expect(store.getState().offeringHash[getKeyForLibraryAndProduct(library, product)].siteLicensePrice)
                .to.equal(666);
        });

        it('should do nothing if the price is the same', function () {
            const store = freshStoreWithLibrariesAndProducts();

            const library = store.getState().libraries.find(l => l.crmId === '4');
            const product = store.getState().products.find(p => p.id === "003083ed-4b09-47b8-a9f5-d6195b13c001");

            const before = store.getState().offeringHash[getKeyForLibraryAndProduct(library, product)];

            store.dispatch({
                type: ActionTypes.SetSiteLicensePrice,
                args: { library, product, siteLicensePrice: 2258 }
            });

            const after = store.getState().offeringHash[getKeyForLibraryAndProduct(library, product)];

            expect(before).to.equal(after);
        });
    });
});
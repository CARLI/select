import {expect} from 'chai';
import {reducer, ActionTypes} from './siteLicenseReducer';
import {createStore} from 'redux';
import deepFreeze from 'deep-freeze';

function freshStore() {
    return createStore(reducer);
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
            const store = freshStore();
            const state = store.getState();
            deepFreeze(state);

            const libraries = getTestLibraries();
            const products = getTestProducts();

            store.dispatch({
                type: ActionTypes.SetLibrariesAndProducts,
                args: {libraries, products}
            });

            expect(store.getState().libraries).to.deep.equal(libraries);
            expect(store.getState().products).to.deep.equal(products);
        });

        it('should create the initial state of the grid hash', function () {

        });
    });
});
import {expect} from 'chai';
import {reducer, ActionTypes} from './siteLicenseReducer';
import {createStore} from 'redux';
import deepFreeze from 'deep-freeze';

function freshStore() {
    return createStore(reducer);
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

    describe('SetLibraries action', function () {
        it('should set the libraries', function () {
            const store = freshStore();
            const state = store.getState();
            deepFreeze(state);

            const libraries = [
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

            store.dispatch({
                type: ActionTypes.SetLibraries,
                args: { libraries }
            });

            expect(store.getState().libraries).to.deep.equal(libraries);
        });
    });

    describe('SetProducts action', function () {
        it('should set the products', function () {
            const store = freshStore();
            const state = store.getState();
            deepFreeze(state);

            const products = [
                {
                    name: "Art Abstracts",
                    offerings: [],
                    type: "Product"
                },
                {
                    name: "Education Abstracts",
                    offerings: [],
                    type: "Product"
                }
            ];

            store.dispatch({
                type: ActionTypes.SetProducts,
                args: {products}
            });
        });
    });
});
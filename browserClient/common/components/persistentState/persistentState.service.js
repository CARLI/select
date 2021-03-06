angular.module('common.persistentState')
    .service('persistentState', persistentState);

function persistentState($window) {
    var storage = $window.localStorage;
    var STORAGE_KEY = 'carliApplicationState';

    var state = {
        currentCycle: null
    };

    initialize();

    function initialize() {
        if (doesStoredStateExist()) {
            state = getStateFromStorage();
        }
    }

    function getCurrentCycle() {
        return state.currentCycle;
    }
    function setCurrentCycle(cycle) {
        state.currentCycle = cycle;
        saveStateToStorage();
    }
    function clearCurrentCycle() {
        state.currentCycle = null;
        saveStateToStorage();
    }

    function doesStoredStateExist() {
        return storage.hasOwnProperty(STORAGE_KEY);
    }

    function getStateFromStorage() {
        return angular.fromJson(getRawStateFromStorage());
    }

    function getRawStateFromStorage() {
        return storage[STORAGE_KEY];
    }

    function saveStateToStorage() {
        console.log('saving state to storage', state);
        if (state) {
            storage[STORAGE_KEY] = angular.toJson(state);
        }
    }

    return {
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle,
        clearCurrentCycle: clearCurrentCycle
    };
}

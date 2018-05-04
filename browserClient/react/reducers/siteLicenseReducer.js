const INITIAL_STATE = {
    gridHash: {},
    libraries: [],
    products: []
};

export const ActionTypes = {
    SetCycle: 'setCycle',
    SetLibraries: 'setLibraries',
    SetProducts: 'setProducts'
};

export function reducer(state = INITIAL_STATE, action = null) {
    if (!action)
        return state;

    if (action.type === ActionTypes.SetCycle)
        return setCycle(state, action.args);

    if (action.type === ActionTypes.SetLibraries)
        return setLibraries(state, action.args);

    if (action.type === ActionTypes.SetProducts)
        return setProducts(state, action.args);

    return state;
}

function setCycle(state, args) {
    return Object.assign({}, state, { cycle: args.cycle });
}

function setLibraries(state, args) {
    return Object.assign({}, state, { libraries: args.libraries });
}

function setProducts(state, args) {
    return Object.assign({}, state, { products: args.products });
}
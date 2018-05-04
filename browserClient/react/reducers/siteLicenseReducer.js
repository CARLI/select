const INITIAL_STATE = {
    gridHash: {},
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
        products: args.products
    });
}
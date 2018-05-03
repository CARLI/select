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
        setCycle(state, action.args);

    return state;
}

function setCycle(state, args) {
    return Object.assign({}, state, { cycle: args.cycle });
}

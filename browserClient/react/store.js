import * as siteLicenseReducer from './reducers/siteLicenseReducer';
import { createStore } from 'redux';

export const store = createStore(siteLicenseReducer.reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
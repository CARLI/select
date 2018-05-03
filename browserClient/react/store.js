import * as siteLicenseReducer from './reducers/siteLicenseReducer';
import { createStore } from 'redux';

export const store = createStore(siteLicenseReducer.reducer);
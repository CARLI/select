import React from 'react';
import { connect } from 'react-redux'
import SiteLicenseGrid from "./siteLicenseGrid";
import {ActionTypes} from "../../reducers/siteLicenseReducer";

const mapStateToProps = (state, ownProps) => {
    return {
        libraries: state.libraries,
        products: state.products,
        offeringHash: state.offeringHash
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setSiteLicensePrice: (siteLicensePrice, library, product) => {
            dispatch({
                type: ActionTypes.SetSiteLicensePrice,
                args: {
                    library,
                    product,
                    siteLicensePrice
                }
            });
        }
    }
};

const SiteLicenseGridContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(SiteLicenseGrid);

export default SiteLicenseGridContainer;
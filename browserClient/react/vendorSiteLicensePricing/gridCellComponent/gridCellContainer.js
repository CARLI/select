import React from 'react';
import { connect } from 'react-redux';
import {ActionTypes, getKeyForLibraryAndProduct} from "../../reducers/siteLicenseReducer";
import GridCell from "./gridCell";

const mapStateToProps = (state, ownProps) => {
    const key = getKeyForLibraryAndProduct(ownProps.library, ownProps.product);

    console.debug(`gridCell mapStateToProps ${state.offeringHash[key].siteLicensePrice}`);

    return {
        cell: state.offeringHash[key]
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setSiteLicensePrice: price => {
            dispatch({
                type: ActionTypes.SetSiteLicensePrice,
                args: {
                    library: ownProps.library,
                    product: ownProps.product,
                    siteLicensePrice: price
                }
            });
        }
    }
};

const GridCellContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GridCell);

export default GridCellContainer;
import React from 'react';
import { connect } from 'react-redux';
import {getKeyForLibraryAndProduct} from "../../reducers/siteLicenseReducer";
import GridCell from "./gridCell";

const mapStateToProps = (state, ownProps) => {
    const key = getKeyForLibraryAndProduct(ownProps.library, ownProps.product);

    return {
        cell: state.offeringHash[key]
    };
};

const GridCellContainer = connect(
    mapStateToProps
)(GridCell);

export default GridCellContainer;
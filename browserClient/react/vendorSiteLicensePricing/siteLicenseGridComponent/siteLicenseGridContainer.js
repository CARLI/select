import React from 'react';
import { connect } from 'react-redux'
import SiteLicenseGrid from "./siteLicenseGrid";

const mapStateToProps = (state, ownProps) => {
    return {
        libraries: state.libraries,
        products: state.products
    };
};

const SiteLicenseGridContainer = connect(
    mapStateToProps
)(SiteLicenseGrid);

export default SiteLicenseGridContainer;
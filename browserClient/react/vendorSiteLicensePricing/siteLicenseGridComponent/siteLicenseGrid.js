import React from 'react';
import GridCellContainer from '../gridCellComponent/gridCellContainer';
import {getKeyForLibraryAndProduct} from "../../reducers/siteLicenseReducer";

const SiteLicenseGrid = ({ libraries, products }) => {
    const productGridColumns = products
        .map(p => '150px')
        .join(' ');

    const productAreaStyle = {
        gridTemplateColumns: productGridColumns
    };

    return (
        <div className="site-license-grid">
            <div className="site-license-grid__library-column">
                <div className="site-license-grid__library-column-header">
                    Library
                </div>
                { libraries.map(library => {
                    return (
                        <div className="site-license-grid__library-label" key={library.crmId}>{library.name}</div>
                    );
                })}
            </div>
            <div className="site-license-grid__product-area" style={productAreaStyle}>
                { products.map(p => {
                    return (
                        <div className="site-license-grid__product-header" key={p.id}>{p.name}</div>
                    );
                })}
                { gridCells(libraries, products) }
            </div>
        </div>
    );
};

function gridCells(libraries, products) {
    const gridCells = [];

    libraries.forEach(l => {
        products.forEach(p => {
            gridCells.push(makeGridCell(l, p));
        });
    });

    return gridCells;
}

function makeGridCell(library, product) {
    return (
        <GridCellContainer
            library={library}
            product={product}
            key={getKeyForLibraryAndProduct(library, product)}/>
    );
}

export default SiteLicenseGrid;
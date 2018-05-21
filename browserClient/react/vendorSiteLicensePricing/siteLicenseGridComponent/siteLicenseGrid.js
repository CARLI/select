import React from 'react';
import { getKeyForLibraryAndProduct } from "../../grid";
import GridCell from "../gridCellComponent/gridCell";

const SiteLicenseGrid = ({ libraries, products }) => {
    const productGridColumns = products
        .map(p => '150px')
        .join(' ');

    const productAreaStyle = {
        gridTemplateColumns: productGridColumns
    };

    function gridCells() {
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
            <GridCell
                library={library}
                product={product}
                key={getKeyForLibraryAndProduct(library, product)}/>
        );
    }

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
                { gridCells() }
            </div>
        </div>
    );
};

export default SiteLicenseGrid;
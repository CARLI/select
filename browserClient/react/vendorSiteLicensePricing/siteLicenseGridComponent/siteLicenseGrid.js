import React from 'react';
import { getKeyForLibraryAndProduct } from "../../grid";
import GridCell from "../gridCellComponent/gridCell";

const SiteLicenseGrid = ({ libraries, products }) => {
    const productGridColumns = products
        .map(p => '150px')
        .join(' ');

    const productColumnTemplate = {
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
            <div className="site-license-grid__product-area">
                <div className="site-license-grid__product-headers" style={productColumnTemplate}>
                    { products.map(p => {
                        return (
                            <div className="site-license-grid__product-header" key={p.id}>{p.name}</div>
                        );
                    })}
                </div>
                <div className="site-license-grid__grid-cells" style={productColumnTemplate}>
                    { gridCells() }
                </div>
            </div>
        </div>
    );
};

export default SiteLicenseGrid;
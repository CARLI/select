import React from 'react';
import LibraryRow from "../libraryRowComponent/libraryRow";

const SiteLicenseGrid = ({ libraries, products }) => {
    return (
        <div className="site-license-grid">
            <div>
                Library
            </div>
            { products.map(p => {
                return (
                    <div key={p.id}>{p.name}</div>
                );
            })}
            { libraries.map(l => {
                return (
                    <LibraryRow library={l} products={products} key={l.crmId} />
                );
            })}
        </div>
    );
};

export default SiteLicenseGrid;
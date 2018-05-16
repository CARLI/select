import React from 'react';
import {getKeyForLibraryAndProduct} from "../../reducers/siteLicenseReducer";
import GridCellContainer from '../gridCellComponent/gridCellContainer';

const LibraryRow = ({library, products}) => {
    return (
        <div className="library-row">
            <div>{ library.name }</div>
            { products.map(product => {
                return (
                    <GridCellContainer library={library} product={product} key={getKeyForLibraryAndProduct(library, product)} />
                );
            })}
        </div>
    );
};

export default LibraryRow;
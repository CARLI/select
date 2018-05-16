import React from 'react';

const GridCell = ({cell}) => {
    return (
        <div className="grid-cell">{ printValue(cell.siteLicensePrice) }</div>
    );
};

export function printValue(siteLicensePrice) {
    return typeof siteLicensePrice === 'number' ?
        siteLicensePrice.toLocaleString('en', {
            currency: 'USD',
            minimumFractionDigits: 2
        }) :
        '-';
}

export default GridCell;
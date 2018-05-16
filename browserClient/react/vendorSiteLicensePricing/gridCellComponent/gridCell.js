import React from 'react';

const GridCell = ({cell}) => {
    const editInputRef = React.createRef();

    function showInput(event) {
        event.stopPropagation();
        editInputRef.current.focus();
    }

    return (
        <div className="grid-cell">
            <div className="grid-cell__display-mode" onClick={showInput}>
                {printValue(cell.siteLicensePrice)}
            </div>
            <input
                ref={editInputRef}
                className="grid-cell__edit-input"
                type="text"
                defaultValue={cell.siteLicensePrice}/>
        </div>
    );
};

function printValue(siteLicensePrice) {
    return typeof siteLicensePrice === 'number' ?
        siteLicensePrice.toLocaleString('en', {
            currency: 'USD',
            minimumFractionDigits: 2
        }) :
        '-';
}

export default GridCell;
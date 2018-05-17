import React from 'react';

const GridCell = ({cell, setSiteLicensePrice}) => {
    const editInputRef = React.createRef();

    function showInput(event) {
        event.stopPropagation();
        editInputRef.current.focus();
    }

    function onBlurHandler(event) {
        const newPrice = parseFloat(event.target.value);
        setSiteLicensePrice(newPrice);
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
                onBlur={onBlurHandler}
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
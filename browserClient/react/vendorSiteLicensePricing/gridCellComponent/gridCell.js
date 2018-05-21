import React from 'react';
import * as grid from '../../grid';

const ENTER_KEY_CODE = 13;

class GridCell extends React.Component {
    constructor(props) {
        super(props);
        const offering = grid.getOffering(props.library, props.product);
        this.state = {
            price: offering.originalPrice
        };
        this.editInputRef = React.createRef();
    }

    render() {
        return (
            <div className="grid-cell">
                <div className="grid-cell__display-mode" onClick={this.showInput.bind(this)}>
                    {this.printPrice()}
                </div>
                <input
                    ref={this.editInputRef}
                    className="grid-cell__edit-input"
                    type="text"
                    onBlur={this.onBlurHandler.bind(this)}
                    onKeyUp={this.onKeyUpHandler.bind(this)}
                    defaultValue={this.state.price}/>
            </div>
        );
    }

    printPrice() {
        return typeof this.state.price === 'number' ?
            this.state.price.toLocaleString('en', {
                currency: 'USD',
                minimumFractionDigits: 2
            }) :
            '-';
    }

    onBlurHandler(event) {
        this.setNewPrice(parseInt(event.target.value, 10));
    }

    onKeyUpHandler(event) {
        if (event.keyCode === ENTER_KEY_CODE)
            this.editInputRef.current.blur();
    }

    showInput(event) {
        event.stopPropagation();
        this.editInputRef.current.focus();
    }

    setNewPrice(price) {
        this.setState({
            price
        });
        grid.updateSiteLicensePrice(this.props.library, this.props.product, price);
    }
}

export default GridCell;
import React from 'react';

export default class GridCell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false
        };

        this.inputRef = React.createRef();
    }

    componentDidUpdate() {
        if (this.state.editMode)
            this.inputRef.current.focus();
    }

    render() {
        return (
            <div className="grid-cell">
                { this.displayMode() }
                { this.editMode() }
            </div>
        );
    }

    displayMode() {
        const style = {
            display: this.state.editMode ? 'none' : 'block'
        };

        return (
            <div className="grid-cell__display-mode" style={style}>
                { GridCell.printValue(this.props.cell.siteLicensePrice) }
                <button
                    className="grid-cell__edit-button"
                    type="button"
                    onClick={this.setEditMode.bind(this)}>

                    <span className="grid-cell__edit-button-text">Edit</span>
                </button>
            </div>
        );
    }

    editMode() {
        const style = {
            display: this.state.editMode ? 'block' : 'none'
        };

        return (
            <input
                style={style}
                ref={this.inputRef}
                className="grid-cell__edit-input"
                type="text"
                defaultValue={this.props.cell.siteLicensePrice} />
        );
    }

    static printValue(siteLicensePrice) {
        return typeof siteLicensePrice === 'number' ?
            siteLicensePrice.toLocaleString('en', {
                currency: 'USD',
                minimumFractionDigits: 2
            }) :
            '-';
    }

    setEditMode() {
        this.setState({
            editMode: true
        });
    }
};
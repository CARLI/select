import {ActionTypes} from "../reducers/siteLicenseReducer";

const React = require('react');
const ReactDom = require('react-dom');
import { store } from '../store';

class VendorSiteLicensePricingComponent extends React.Component {
    constructor(props) {
        super();

        store.dispatch({
            type: ActionTypes.SetCycle,
            args: { cycle: props.angularController.cycle }
        });

        this.user = props.angularController.user;
        this.modules = props.modules;
        this.angularController = props.angularController;

        this.activate();
    }

    activate() {
        Promise.all([
            this.modules.Library.listActiveLibraries(),
            this.modules.ProductMiddleware.listProductsWithOfferingsForVendorId(this.user.vendor.id, store.getState().cycle)
        ]).then(([libraries, products]) => {
            store.dispatch({
                type: ActionTypes.SetLibraries,
                args: { libraries }
            });

            store.dispatch({
                type: ActionTypes.SetProducts,
                args: { products }
            });

            console.debug('libraries', libraries);
            console.debug('products', products);
        });
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}

function renderComponent(element, angularController) {
    const modules = window.CARLI;
    ReactDom.render(React.createElement(VendorSiteLicensePricingComponent, {modules, angularController}), element);
}

module.exports = {
    render: renderComponent
};
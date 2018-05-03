const React = require('react');
const ReactDom = require('react-dom');
import { store } from '../store';

class VendorSiteLicensePricingComponent extends React.Component {
    constructor(props) {
        super();
        this.state = {
            cycle: props.angularController.cycle,
            user: props.angularController.user
        };
        this.modules = props.modules;
        this.angularController = props.angularController;

        this.activate();
    }

    activate() {
        Promise.all([
            this.modules.Library.listActiveLibraries(),
            this.modules.ProductMiddleware.listProductsWithOfferingsForVendorId(this.state.user.vendor.id, this.state.cycle)
        ]).then(([listOfLibraries, products]) => {
            this.setState({
                libraries: listOfLibraries,
                products: products
            });

            this.angularController.callback('I loaded my data');
        });
    }

    render() {
        return (
            <div>
                <h2>Libraries</h2>
                <div className="vendor-site-license-pricing-component">
                    { JSON.stringify(this.state.libraries) }
                </div>
                <h2>Products</h2>
                <div>
                    { JSON.stringify(this.state.products) }
                </div>
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
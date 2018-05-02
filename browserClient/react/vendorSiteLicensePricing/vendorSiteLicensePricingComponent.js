const React = require('react');
const ReactDom = require('react-dom');

class VendorSiteLicensePricingComponent extends React.Component {
    constructor(props) {
        super();
        this.state = {
            cycle: props.cycle,
            user: props.user
        };
        this.modules = props.modules;

        this.activate();
    }

    activate() {
        console.log('activate vendor pricing component', this.modules);

        Promise.all([
            this.modules.Library.listActiveLibraries(),
            this.modules.ProductMiddleware.listProductsWithOfferingsForVendorId(this.state.user.vendor.id, this.state.cycle)
        ])
            .then(([listOfLibraries, products]) => {
                this.setState({
                    libraries: listOfLibraries,
                    products: products
                });
            });
    }

    render() {
        return <div className="vendor-site-license-pricing-component">
            { JSON.stringify(this.state) }
        </div>;
    }
}

function renderComponent(element, angularControllerObject) {
    const modules = window.CARLI;
    const user = angularControllerObject.user;
    const cycle = angularControllerObject.cycle;
    ReactDom.render(React.createElement(VendorSiteLicensePricingComponent, {modules, user, cycle}), element);
}

module.exports = {
    render: renderComponent
};
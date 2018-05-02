const React = require('react');
const ReactDom = require('react-dom');

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

                this.angularController.callback('I loaded my data');
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
    const angularController = angularControllerObject;
    ReactDom.render(React.createElement(VendorSiteLicensePricingComponent, {modules, angularController}), element);
}

module.exports = {
    render: renderComponent
};
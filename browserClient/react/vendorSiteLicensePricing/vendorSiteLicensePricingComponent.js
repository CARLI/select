import * as grid from '../grid';
import SiteLicenseGrid from "./siteLicenseGridComponent/siteLicenseGrid";

const React = require('react');
const ReactDom = require('react-dom');

class VendorSiteLicensePricingComponent extends React.Component {
    constructor(props) {
        super();
        this.state = {
            cycle: props.angularController.cycle,
            libraries: [],
            products: []
        };
        this.user = props.angularController.user;
        this.modules = props.modules;
        this.angularController = props.angularController;

        this.activate();
    }

    activate() {
        Promise.all([
            this.modules.Library.listActiveLibraries(),
            this.modules.ProductMiddleware.listProductsWithOfferingsForVendorId(this.user.vendor.id, this.state.cycle)
        ]).then(([libraries, products]) => {
            grid.setLibrariesAndProducts(libraries, products);
            this.setState({ libraries, products });

            // const slicedProducts = products.slice(0, 2);
            // slicedProducts.forEach(p => {
            //     console.debug(p.id);
            //     const offerings = p.offerings
            //         .filter(o => {
            //             return o.library === '3' || o.library === '4' || o.library === '11'
            //         })
            //         .map(o => {
            //             return {
            //                 library: o.library,
            //                 pricing: o.pricing,
            //                 type: o.type
            //             };
            //         });
            //     console.debug(JSON.stringify(offerings));
            // });
        });
    }

    render() {
        return (
            <SiteLicenseGrid libraries={this.state.libraries} products={this.state.products} />
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
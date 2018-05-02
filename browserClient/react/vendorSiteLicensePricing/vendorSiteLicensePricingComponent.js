const React = require('react');
const ReactDom = require('react-dom');

const VendorSiteLicensePricingComponent = function() {
    console.log('VendorSiteLicensePricingComponent');

    return <div className="vendor-site-license-pricing-component">This is the react component!</div>;
};

function renderComponent(divId) {
    ReactDom.render(React.createElement(VendorSiteLicensePricingComponent), document.getElementById(divId));
}

module.exports = {
    render: renderComponent
};
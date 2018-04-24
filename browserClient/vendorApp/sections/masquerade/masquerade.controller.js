angular.module('vendor.sections.masquerade')
    .controller('masqueradeController', masqueradeController);

function masqueradeController(config, vendorService) {
    var vm = this;

    vm.vendors = [];
    vm.vendorAppBrowsingContextId = config.vendorAppBrowsingContextId;

    activate();

    function activate() {
        vendorService.listActive().then(function (vendors) {
            vm.vendors = vendors.map(vendorWithMasqueradingUrl);
        });

        function vendorWithMasqueradingUrl(vendor) {
            vendor.masqueradingUrl = config.vendorWebAppUrl + '?masquerade-as-vendor=' + vendor.id;
            return vendor;
        }
    }
}

angular.module('vendor.sections.masquerade')
    .controller('masqueradeController', masqueradeController);

function masqueradeController(config, vendorService) {
    var vm = this;

    vm.vendors = [];

    activate();

    function activate() {
        console.log('Here i am!');
        vendorService.list().then(function (vendors) {
            vm.vendors = vendors.map(vendorWithMasqueradingUrl);
        });

        function vendorWithMasqueradingUrl(vendor) {
            vendor.masqueradingUrl = config.vendorWebAppUrl + '?masquerade-as-vendor=' + vendor.id;
            return vendor;
        }
    }
}

angular.module('carli.bannerService')
    .factory('bannerService', bannerService);

function bannerService(CarliModules, $q, browserDownloadService) {
    var bannerModule = CarliModules.Banner;

    return {
        getDataForBannerExport: getDataForBannerExport,
        downloadBannerExportForInvoices: downloadBannerExportForInvoices
    };

    function getDataForBannerExport(cycle, batchId) {
        return $q.when( bannerModule.getDataForBannerExport(cycle, batchId) );
    }

    function downloadBannerExportForInvoices(cycle, batchId) {
        return getDataForBannerExport(cycle, batchId)
            .then(function(exportData) {
                browserDownloadService.browserDownload(getBannerExportFilename(), 'text/plain;charset=utf-8', exportData);
            });

        function getBannerExportFilename() {
            var d = new Date();
            var month  = zeroPaddedString(d.getMonth());
            var day    = zeroPaddedString(d.getDate());
            var hour   = zeroPaddedString(d.getHours());
            var minute = zeroPaddedString(d.getMinutes());
            var second = zeroPaddedString(d.getSeconds());

            var timestamp = '' + d.getFullYear() + month + day + hour + minute + second;

            return 'fi_ar_general_feeder.9carli.' + timestamp + '.txt';

            function zeroPaddedString(n) {
                return (n < 10) ? '0' + n : '' + n;
            }
        }
    }
}

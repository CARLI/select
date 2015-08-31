angular.module('common.browserDownload')
.factory('browserDownloadService', browserDownloadService);

function browserDownloadService($window) {
    return {
        browserDownload: browserDownload
    };

    function browserDownload (fileName, blobType, content) {
        var blob = new Blob([ content ], { type: blobType });
        //TODO: feature detect saveAs and try a workaround if it's missing, or at least show an error
        $window.saveAs(blob, fileName);
    }
}


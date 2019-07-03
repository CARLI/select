angular.module('common.browserDownload')
.factory('browserDownloadService', browserDownloadService);

function browserDownloadService($window) {
    return {
        browserDownload: browserDownload
    };

    function browserDownload (fileName, blobType, content) {
        var blob = new Blob([ content ], { type: blobType });
        if ($window.hasOwnProperty("saveAs")) {
            $window.saveAs(blob, fileName);
        } else {
            download(blob, fileName);
        }
    }
}

function download(blob, filename) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(blob));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

angular.module('common.browserDownload')
.factory('browserDownloadService', browserDownloadService);

function browserDownloadService($window) {
    return {
        browserDownload: browserDownload
    };

    function browserDownload (fileName, blobType, content) {
        if ($window.hasOwnProperty("saveAs")) {
            var blob = new Blob([ content ], { type: blobType });
            $window.saveAs(blob, fileName);
        } else {
            download(fileName, blobType, content);
        }
    }
}

function download(fileName, blobType, content) {
  var element = document.createElement('a');
  element.setAttribute('href', `data:${blobType},${encodeURIComponent(content)}`);
  element.setAttribute('download', fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

angular.module('common.fileUploadButton')
    .controller('fileUploadButtonController', fileUploadButtonController);

function fileUploadButtonController($q) {
    var vm = this;
    
    vm.onFileReadSuccess = promiseFileContents;

    function promiseFileContents(fileInfo, fileContentsAsText) {
        return $q.when(fileContentsAsText);
    }
}

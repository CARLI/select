angular.module('common.fileUploadList')
    .controller('fileUploadListController', fileUploadListController);

function fileUploadListController( attachmentsService, errorHandler ){
    var vm = this;

    vm.attachFile = attachFile;

    activate();

    function activate(){
        attachmentsService.listAttachments(vm.documentId)
            .then(function(attachmentsObject){
                console.log('Loaded attachments', attachmentsObject);
            });
    }

    function attachFile(fileInfo, fileContentsAsArrayBuffer){
        var fileName = fileInfo.name;
        console.log('controller attach file '+fileName+' to '+vm.documentId);
        var fileType = fileInfo.type;
        attachmentsService.uploadFile(vm.documentId, fileName, fileType, fileContentsAsArrayBuffer)
            .then(attachSuccess, errorHandler, attachProgress);

        function attachSuccess(){
            console.log('Attachment successful!');
        }

        function attachProgress(percent){
            console.log('progress '+percent+'%');
        }
    }

}
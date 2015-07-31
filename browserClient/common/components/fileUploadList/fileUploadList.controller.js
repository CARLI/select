angular.module('common.fileUploadList')
    .controller('fileUploadListController', fileUploadListController);

function fileUploadListController( $filter, attachmentsService, errorHandler ){
    var vm = this;

    vm.orderBy = 'order';

    vm.uploadButtonLabel = vm.uploadButtonLabel || 'Upload new file';

    vm.attachFile = attachFile;

    activate();

    function activate(){
        attachmentsService.listAttachments(vm.documentId)
            .then(function(attachmentsObject){
                vm.files = transformAttachmentsObjectToArray(attachmentsObject);
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

    function transformAttachmentsObjectToArray(attachmentsObject){
        return Object.keys(attachmentsObject).map(function(fileName){
            var properties = attachmentsObject[fileName];
            var fileUrl = attachmentsService.getAttachmentUrl(vm.documentId, fileName);

            return {
                link: fileUrl,
                name: fileName,
                size: properties['length'], //bytes
                order: properties['revpos']
            };
        });
    }
}
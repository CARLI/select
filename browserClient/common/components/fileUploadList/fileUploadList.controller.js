angular.module('common.fileUploadList')
    .controller('fileUploadListController', fileUploadListController);

function fileUploadListController( attachmentsService, errorHandler ){
    var vm = this;

    vm.loadingPromise = null;
    vm.orderBy = 'order';
    vm.uploadButtonLabel = vm.uploadButtonLabel || 'Upload new file';

    vm.attachFile = attachFile;

    activate();

    function activate(){
        loadFileList();
    }

    function loadFileList(){
        vm.loadingPromise = attachmentsService.listAttachments(vm.documentId, vm.attachmentCategory)
            .then(function(attachmentsObject){
                vm.files = transformAttachmentsObjectToArray(attachmentsObject);
            });

        return vm.loadingPromise;
    }

    function attachFile(fileInfo, fileContentsAsArrayBuffer){
        var fileName = fileInfo.name;
        var fileType = fileInfo.type;
        attachmentsService.uploadFile(vm.documentId, fileName, fileType, fileContentsAsArrayBuffer, vm.attachmentCategory)
            .then(attachSuccess, errorHandler, attachProgress);

        function attachSuccess(){
            console.log('Attachment successful!');
            loadFileList();
        }

        function attachProgress(percent){
            console.log('progress '+percent+'%');
        }
    }

    function transformAttachmentsObjectToArray(attachmentsObject){
        if ( !attachmentsObject ){
            return [];
        }

        var attachmentKeys = Object.keys(attachmentsObject);

        if ( !attachmentKeys || !attachmentKeys.length ){
            return [];
        }

        var files = attachmentKeys.map(function(fileName){
            var properties = attachmentsObject[fileName];
            var fileUrl = attachmentsService.getAttachmentUrl(vm.documentId, fileName);

            return {
                link: fileUrl,
                name: fileName,
                category: fileName.substring(0, fileName.indexOf('/')),
                size: properties['length'], //bytes
                order: properties['revpos']
            };
        });

        if ( vm.attachmentCategory ){
            files = files.filter(function(file){
                return file.category === vm.attachmentCategory;
            });

            files.forEach(function(file){
                file.name = file.name.substring(file.name.indexOf('/')+1);
            });
        }

        return files;
    }
}
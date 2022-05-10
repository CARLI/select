angular.module('common.fileUploadList')
    .controller('fileUploadListController', fileUploadListController);

function fileUploadListController( alertService, attachmentsService, errorHandler, userService ){
    var vm = this;

    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.loadingPromise = null;
    vm.orderBy = 'order';
    vm.uploadButtonLabel = vm.uploadButtonLabel || 'Upload new file';
    vm.uploadInProgress = false;
    vm.uploadProgress = 0;

    vm.attachFile = attachFile;
    vm.deleteFile = deleteFile;

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
        vm.uploadInProgress = true;
        vm.uploadProgress = 0;
        var fileNameUnescaped = fileInfo.name;
        var fileName = encodeURIComponent(fileNameUnescaped);
        var fileType = fileInfo.type;

        attachmentsService.uploadFile(vm.documentId, fileName, fileType, fileContentsAsArrayBuffer, vm.attachmentCategory)
            .then(attachSuccess, attachFailed, attachProgress);

        function attachSuccess(){
            vm.uploadInProgress = false;
            alertService.putAlert(fileNameUnescaped + ' successfully uploaded', {severity: 'success'});
            return loadFileList();
        }

        function attachProgress(percent){
            vm.uploadProgress = percent;
        }

        function attachFailed(err){
            vm.uploadInProgress = false;
            errorHandler(err);
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
            var fileNameUnescaped = decodeURIComponent(fileName);

            return {
                link: fileUrl,
                name: fileName,
                nameUnescaped: fileNameUnescaped,
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

    function deleteFile(file){
        var fileNameUnescaped = decodeURIComponent(file.name);
        var confirmDelete = confirm('Are you sure you want to delete '+fileNameUnescaped+'? This cannot be undone.');

        if ( confirmDelete ){
            return attachmentsService.deleteFile(vm.documentId, file.name, file.category)
                .then(function(){
                    alertService.putAlert(fileNameUnescaped + ' successfully deleted', {severity: 'success'});
                    return loadFileList();
                })
                .catch(errorHandler);
        }
    }
}

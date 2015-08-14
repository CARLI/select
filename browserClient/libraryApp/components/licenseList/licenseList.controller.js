angular.module('library.licenseList')
    .controller('licenseListController', licenseListController);

function licenseListController( attachmentsService, errorHandler ){
    var vm = this;

    vm.attachmentCategory = 'redacted';
    vm.loadingPromise = null;
    vm.orderBy = 'order';

    activate();

    function activate(){
        loadFileList();
    }

    function loadFileList(){
        console.log('license list load '+vm.licenseId+' '+vm.attachmentCategory);
        vm.loadingPromise = attachmentsService.listAttachments(vm.licenseId, vm.attachmentCategory)
            .then(function(attachmentsObject){
                vm.files = transformAttachmentsObjectToArray(attachmentsObject);
            })
            .catch(errorHandler);

        return vm.loadingPromise;
    }

    function transformAttachmentsObjectToArray(attachmentsObject){ //TODO: could put this in the attachmentsService since it's common
        if ( !attachmentsObject ){
            return [];
        }

        var attachmentKeys = Object.keys(attachmentsObject);

        if ( !attachmentKeys || !attachmentKeys.length ){
            return [];
        }

        var files = attachmentKeys.map(function(fileName){
            var properties = attachmentsObject[fileName];
            var fileUrl = attachmentsService.getAttachmentUrl(vm.licenseId, fileName);

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
angular.module('common.fileUploadList')
    .directive('fileUploadList', function(errorHandler, fileReader){
        return {
            restrict: 'E',
            template: [
                '<ul cg-busy="vm.loadingPromise">',
                '  <li ng-repeat="file in vm.files | orderBy:vm.orderBy">',
                '    <a ng-href="{{ file.link }}" class="file" target="_blank">{{ file.nameUnescaped }}</a>',
                '    <button type="button" class="delete clear-button-styles" title="Delete {{ file.name }}" ng-click="vm.deleteFile(file)" ng-if="!vm.userIsReadOnly">',
                '      <span class="sr-only">Delete {{ file.name }}</span><fa name="remove"></fa>',
                '    </button>',
                '  </li>',
                '</ul>',
                '<input type="file" ng-model="vm.fileToUpload" ng-disabled="vm.userIsReadOnly">',
                '<button type="button" class="upload" ng-show="!vm.userIsReadOnly">{{ vm.uploadButtonLabel }}</button>',
                '<div class="uploadProgress" ng-show="vm.uploadInProgress">Upload progress: {{ vm.uploadProgress }}%</div>'
            ].join(''),
            scope: {
                documentId: '=',
                attachmentCategory: '@',
                uploadButtonLabel: '@'
            },
            controller: 'fileUploadListController',
            controllerAs: 'vm',
            bindToController: true,
            link: function(scope, element, attributes, controller) {
                var uploadButton = $('button.upload', element);
                var fileInput = $('input[type=file]', element);

                uploadButton.on('click', showFileUploadDialog);
                fileInput.on('change', handleFileUpload);

                function showFileUploadDialog(){
                    fileInput.click();
                }

                function handleFileUpload(e){
                    var fileInputElement = this;
                    var fileList = fileInputElement.files;
                    var fileToUpload = fileList[0];

                    if ( fileToUpload.size > fileReader.maxFileSize ){
                        scope.$apply(function(){
                            errorHandler('Selected file is too large to upload');
                        });
                        return;
                    }

                    scope.$apply(function(){
                        fileReader.read( fileToUpload ).then(
                            function success( result ){
                                if ( controller ){
                                    controller.attachFile(fileToUpload, result);
                                }
                                else {
                                    console.warn('File Upload controller is missing!');
                                }
                            },
                            function error( err ){
                                errorHandler('There was an error reading the file: '+err);
                            },
                            function progress( notification ){
                                Logger.log('file read progress', notification);
                            }
                        );
                    });
                }
            }
        };
    });

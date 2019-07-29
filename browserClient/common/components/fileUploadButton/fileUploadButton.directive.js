angular.module('common.fileUploadButton')
    .directive('fileUploadButton', function(errorHandler, fileReader){
        return {
            restrict: 'E',
            template: [
                '<input type="file" ng-model="vm.fileToUpload">',
                '<button type="button" class="upload carli-button">{{ vm.uploadButtonLabel }}</button>'
            ].join(''),
            scope: {
                uploadButtonLabel: '@',
                fileReadSuccessCallback: '='
            },
            controller: 'fileUploadButtonController',
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
                        fileReader.readFileAsText( fileToUpload ).then(
                            function success( result ){
                                if ( controller && controller.hasOwnProperty('onFileReadSuccess')){
                                    controller.onFileReadSuccess(fileToUpload, result)
                                        .then(function (r) {
                                            console.log('calling back', controller);
                                            controller.fileReadSuccessCallback(r);
                                        });
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

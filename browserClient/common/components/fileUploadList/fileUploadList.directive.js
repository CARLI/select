angular.module('common.fileUploadList')
    .directive('fileUploadList', function(fileReader){
        return {
            restrict: 'E',
            template: [
                '<ul>',
                '  <li ng-repeat="file in vm.files | orderBy:vm.orderBy">',
                '    <a ng-href="{{ file.link }}" class="file" target="_blank">{{ file.name }}</a>',
                '  </li>',
                '</ul>',
                '<input type="file" ng-model="vm.fileToUpload" ng-change="vm.upload()">',
                '<button type="button" class="upload">{{ vm.uploadButtonLabel }}</button>'
            ].join(''),
            scope: {
                documentId: '='
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
                            console.log('error reading file: ', error);
                        },
                        function progress( notification ){
                            console.log('file upload progress', notification);
                        }
                    );
                }
            }
        };
    });
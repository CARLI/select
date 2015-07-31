angular.module('common.fileUploadList')
    .directive('fileUploadList', function(fileReader){
        return {
            restrict: 'E',
            template: [
                '<h1>Files:</h1>',
                '<ul>',
                '  <li ng-repeat="file in vm.files | orderBy:vm.orderBy">',
                '    <b>{{ file.name }}</b>',
                '  </li>',
                '</ul>',
                '<input type="file" ng-model="vm.fileToUpload" ng-change="vm.upload()">',
                '<button type="button" class="upload">Upload</button>'
            ].join(''),
            scope: {
                databaseName: '@',
                documentId: '@'
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
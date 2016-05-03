angular.module('common.fileReader')
    .service('fileReader', function($q){
        var MAX_FILE_SIZE = 25 * 1000 * 1000;

        return {
            maxFileSize: MAX_FILE_SIZE,
            read: function (file) {
                console.warn('Deprecation warning: common.fileReader.read() has been replaced with readFileAsArrayBuffer or readFileAsText');
                return readFileAsArrayBuffer(file);
            },
            readFile: readFile,
            readFileAsArrayBuffer: readFileAsArrayBuffer,
            readFileAsText: readFileAsText
        };

        function readFileAsArrayBuffer(file) {
            return readFile(file, 'readAsArrayBuffer');
        }
        function readFileAsText(file) {
            return readFile(file, 'readAsText');
        }

        function readFile( file, readMethod ){

            var deferred = $q.defer();

            if ( !file ){
                deferred.reject( new Error('fileReader: no file specified') );
            }

            var reader = new FileReader();

            reader.onabort = function(e){
                deferred.reject( new Error('fileReader: file upload aborted') );
            };

            reader.onerror = function(e){
                deferred.reject( new Error('fileReader: file upload error',e) );
            };

            reader.onload = function(e){
                deferred.resolve(e.target.result);
            };

            reader.onprogress = function(e){
                deferred.notify( 100 * (e.loaded/e.total).toFixed() );
            };

            reader[readMethod](file);

            return deferred.promise;
        }
    });

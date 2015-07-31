angular.module('carli.attachments')
    .service('attachmentsService', attachmentsService);

function attachmentsService( CarliModules, $q, errorHandler ) {

    var attachmentsModule = CarliModules.Attachments;

    return {
        listAttachments: listAttachments,
        uploadFile: uploadFile
    };

    function listAttachments( documentId ){
        return $q.when( attachmentsModule.listAttachments(documentId) );
    }

    function uploadFile( documentId, fileName, fileType, fileContentsInArrayBuffer ){
        var url = attachmentsModule.getAttachmentUrl(documentId, fileName);

        return getDocumentRevision(documentId)
            .then(sendAttachmentRequest);

        function sendAttachmentRequest(revision){
            var attachmentPromise = $q.defer();

            var attachmentRequest = new XMLHttpRequest();

            attachmentRequest.upload.addEventListener('progress', updateProgress, false);

            attachmentRequest.addEventListener('load', attachmentComplete, false);
            attachmentRequest.addEventListener('error', requestError, false);
            attachmentRequest.addEventListener('abort', requestAbort, false);

            attachmentRequest.open('put', url);

            attachmentRequest.setRequestHeader('Content-Type', fileType);
            attachmentRequest.setRequestHeader('If-Match', revision);

            //console.log('send couch attachment '+url);

            attachmentRequest.send(fileContentsInArrayBuffer);

            return attachmentPromise.promise;

            function requestError(event){
                attachmentFailed(attachmentRequest.statusText, attachmentRequest.status);
            }

            function requestAbort(event){
                attachmentFailed('Request aborted', attachmentRequest.status);
            }

            function attachmentComplete(event){
                if ( isOk(attachmentRequest.status) ){
                    attachmentPromise.resolve('upload successful');
                }
                else {
                    attachmentFailed(attachmentRequest.statusText, attachmentRequest.status);
                }

                function isOk( code ){
                    return code >= 200 && code <= 299;
                }
            }

            function updateProgress (event) {
                if (event.lengthComputable) {
                    var percentComplete = (event.loaded / event.total) * 100;
                    attachmentPromise.notify(percentComplete.toFixed());
                }
            }

            function attachmentFailed(message, status){
                attachmentPromise.reject({
                    message: message,
                    statusCode: status
                });
            }
        }
    }

    function getDocumentRevision(documentId){
        return $q.when( attachmentsModule.getDocumentRevision(documentId) );
    }
}

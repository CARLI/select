angular.module('carli.attachments')
    .service('attachmentsService', attachmentsService);

function attachmentsService( CarliModules, $q, errorHandler ) {

    var attachmentsModule = CarliModules.Attachments;

    return {
        listAttachments: listAttachments
    };

    function listAttachments( documentId ){
        return $q.when( attachmentsModule.listAttachments(documentId) );
    }

    function getDocumentRevision(documentId){
        return $q.when( attachmentsModule.getDocumentRevision(documentId) );
    }
}

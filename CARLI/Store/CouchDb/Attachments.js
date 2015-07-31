var carliError = require('../../Error');
var Q = require('q');
var request = require('../../../config/environmentDependentModules/request');

module.exports = Attachments;

function Attachments(storeOptions) {

    if (!storeOptions){
        throw new Error('Attachments module requires store options');
    }

    if (!storeOptions.couchDbUrl){
        throw new Error('Attachments module requires couchDbUrl in store options');
    }

    if (!storeOptions.couchDbName){
        throw new Error('Attachments module requires couchDbName in store options');
    }

    return {
        setAttachment: setAttachment,
        getAttachment: getAttachment,
        getAttachmentUrl: getAttachmentUrl,
        getDocumentRevision: getDocumentRevision,
        listAttachments: listAttachments
    };

    function setAttachment(documentId, attachmentName, contentType, content, optionalAttachmentCategory){
        if ( !documentId ){
            return Q.reject('setAttachment called without a document ID');
        }

        if ( !attachmentName ){
            return Q.reject('setAttachment called without an attachment name');
        }

        if ( !contentType ){
            return Q.reject('setAttachment called without a content type');
        }

        var putAttachmentRequestOptions = {
            body: content,
            method: 'put',
            url: getAttachmentUrl( documentId, attachmentName, optionalAttachmentCategory ),
            headers: {
                'Content-Type': contentType
            }
        };

        return getDocumentRevision(documentId)
            .then(function(documentRevision){
                putAttachmentRequestOptions.headers['If-Match'] = documentRevision;
                return couchRequest(putAttachmentRequestOptions);
            });
    }

    function getAttachment(documentId, attachmentName, optionalAttachmentCategory){
        if ( !documentId ){
            return Q.reject('setAttachment called without a document ID');
        }

        if ( !attachmentName ){
            return Q.reject('setAttachment called without an attachment name');
        }

        var getAttachmentRequestOptions = {
            method: 'get',
            url: getAttachmentUrl( documentId, attachmentName, optionalAttachmentCategory )
        };

        var deferred = Q.defer();
        request(getAttachmentRequestOptions, handleGetAttachmentResponse);
        return deferred.promise;

        function handleGetAttachmentResponse(error, response, body){
            if (error) {
                deferred.reject(carliError(error, statusCode));
            }
            else {
                deferred.resolve(body);
            }
        }
    }

    function getDocumentRevision(docId){
        var headOptions = {
            method: 'head',
            url: getDocumentUrl(docId)
        };

        var deferred = Q.defer();
        request(headOptions, handleHeadResponse);
        return deferred.promise;

        function handleHeadResponse(error, response){
            if (error) {
                deferred.reject(carliError(error, statusCode));
            }
            else {
                if ( response.headers ){
                    deferred.resolve(response.headers['etag']);
                }
                else if ( response.getResponseHeader ){
                    deferred.resolve(response.getResponseHeader('etag'));
                }
                else {
                    deferred.reject(carliError('No etag header in response'));
                }
            }
        }
    }

    function listAttachments( documentId ){
        if ( !documentId ){
            return Q.reject('setAttachment called without a document ID');
        }

        var listAttachmentsRequestOptions = {
            method: 'get',
            url: getDocumentUrl(documentId)

        };

        return couchRequest(listAttachmentsRequestOptions)
            .then(function(document){
                return document._attachments;
            });

    }

    function getDocumentUrl( documentId ){
        return storeOptions.couchDbUrl + '/' + storeOptions.couchDbName + '/' + documentId;
    }

    function getAttachmentUrl( documentId, attachmentName, optionalAttachmentCategory ){
        return getDocumentUrl(documentId) + '/' + ( optionalAttachmentCategory ? optionalAttachmentCategory + '/' : '') + attachmentName;
    }
}


function couchRequest(options) {
    var deferred = Q.defer();
    request(options, handleCouchResponse);
    return deferred.promise;

    function handleCouchResponse(error, response, body) {
        var data;
        var statusCode = 500;
        if (response) {
            statusCode = response.statusCode;
        }

        if (error) {
            deferred.reject(carliError(error, statusCode));
        }
        else {
            if (typeof body === 'string') {
                try {
                    data = JSON.parse(body);
                }
                catch (parseError) {
                    data = {error: 'error parsing ' + body};
                }
            }
            else {
                data = body;
            }

            if (data && data.error) {
                deferred.reject(carliError(data, statusCode));
            }
            else {
                deferred.resolve(data);
            }
        }
    }
}
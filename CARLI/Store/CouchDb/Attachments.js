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
        getAttachment: getAttachment
    };

    function setAttachment(docId, attachmentName, contentType, content){
        if ( !docId ){
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
            url: storeOptions.couchDbUrl + '/' + storeOptions.couchDbName + '/' + docId + '/' + attachmentName,
            headers: {
                'Content-Type': contentType
            }
        };

        return getDocumentRevision(docId)
            .then(function(documentRevision){
                putAttachmentRequestOptions.headers['If-Match'] = documentRevision;
                return couchRequest(putAttachmentRequestOptions);
            });
    }

    function getAttachment(docId, attachmentName){
        if ( !docId ){
            return Q.reject('setAttachment called without a document ID');
        }

        if ( !attachmentName ){
            return Q.reject('setAttachment called without an attachment name');
        }

        var getAttachmentRequestOptions = {
            method: 'get',
            url: storeOptions.couchDbUrl + '/' + storeOptions.couchDbName + '/' + docId + '/' + attachmentName
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
            url: storeOptions.couchDbUrl + '/' + storeOptions.couchDbName + '/' + docId
        };

        var deferred = Q.defer();
        request(headOptions, handleHeadResponse);
        return deferred.promise;

        function handleHeadResponse(error, response){
            if (error) {
                deferred.reject(carliError(error, statusCode));
            }
            else {
                deferred.resolve(response.headers['etag']);
            }
        }
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
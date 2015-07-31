var Attachments = require('../Store/CouchDb/Attachments');
var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
var CouchDbStore = require('../Store/CouchDb/Store');
var expect = chai.expect;
var testUtils = require('./utils');
var Q = require('q');
var Store = require( '../Store/' );
var storeOptions = require( '../../config').storeOptions;
var uuid = require('node-uuid');

var attachmentsModule = null;
var testAttachmentCategory = 'foo';
var testAttachmentContent = 'test content ' + uuid.v4();
var testAttachmentName = 'test-attachment-' + uuid.v4();
var testStoreOptions = testUtils.getTestDbStoreOptions();
var textMimeType = 'text/plain';

chai.use(chaiAsPromised);
testUtils.setupTestDb();

context('The Attachments Module', function(){
    it('should provide a pseudo-constructor function', function(){
        expect(Attachments).to.be.a('function');
    });

    it('should throw an error if not initialized with store options', function(){
        function badInitNoOptions(){
            return Attachments();
        }
        expect(badInitNoOptions).to.throw(/requires store options/);
    });

    it('should throw an error if not initialized with a couchDbUrl', function(){
        function badInitNocouchDbUrl(){
            return Attachments({});
        }
        expect(badInitNocouchDbUrl).to.throw(/requires couchDbUrl/);
    });

    it('should throw an error if not initialized with a couchDbName', function(){
        function badInitNocouchDbName(){
            return Attachments({couchDbUrl:'test'});
        }
        expect(badInitNocouchDbName).to.throw(/requires couchDbName/);
    });

    it('should provide a setAttachment method', function(){
        var attachmentsModule = Attachments(testStoreOptions);
        expect(attachmentsModule.setAttachment).to.be.a('function');
    });

    it('should provide a getAttachment method', function(){
        var attachmentsModule = Attachments(testStoreOptions);
        expect(attachmentsModule.getAttachment).to.be.a('function');
    });

    describe('setAttachment', function(){
        beforeEach(function(done){
            attachmentsModule = Attachments(testStoreOptions);
            done();
        });

        it('should reject if the document id is missing', function(){
            return expect(attachmentsModule.setAttachment()).to.be.rejected;
        });

        it('should reject if the attachment name is missing', function(){
            return expect(attachmentsModule.setAttachment('documentId')).to.be.rejected;
        });

        it('should reject if the content type is missing', function(){
            return expect(attachmentsModule.setAttachment('documentId', 'attachmentName')).to.be.rejected;
        });

        it('should return an id when setting an attachment on a document', function(){
            return putGenericTestDocument()
                .then(putAttachment)
                .then(expectCouchAttachmentResult);
        });

        it('should with when setting an category for an attachment', function(){
            return putGenericTestDocument()
                .then(putAttachmentWithCategory)
                .then(expectCouchAttachmentResult);
        });
    });

    describe('getAttachment', function() {
        beforeEach(function(done){
            attachmentsModule = Attachments(testStoreOptions);
            done();
        });

        it('should reject if the document id is missing', function(){
            return expect(attachmentsModule.getAttachment()).to.be.rejected;
        });

        it('should reject if the attachment name is missing', function(){
            return expect(attachmentsModule.getAttachment('documentId')).to.be.rejected;
        });

        it('should return the attachment content', function(){
            return putGenericTestDocument()
                .then(putAttachment)
                .then(getAttachment)
                .then(function(attachmentResults){
                    return expect(attachmentResults).to.equal(testAttachmentContent);
                })
        });

        it('should return the attachment content for a category', function(){
            return putGenericTestDocument()
                .then(putAttachmentWithCategory)
                .then(getAttachmentWithCategory)
                .then(function(attachmentResults){
                    return expect(attachmentResults).to.equal(testAttachmentContent);
                })
        });
    });

    describe('listAttachments', function(){
        beforeEach(function(done){
            attachmentsModule = Attachments(testStoreOptions);
            done();
        });

        it('should reject if the document id is missing', function(){
            return expect(attachmentsModule.listAttachments()).to.be.rejected;
        });

        it('should return the attachment content', function(){
            return putGenericTestDocument()
                .then(putAttachment)
                .then(function(attachmentResult){
                    return attachmentsModule.listAttachments(attachmentResult.id)
                })
                .then(function(attachmentListResults){
                    return Q.all([
                        expect(attachmentListResults).to.be.an('object'),
                        expect(attachmentListResults[testAttachmentName]).to.be.an('object')
                    ]);
                })
        });
    });
});

function putGenericTestDocument(){
    var couchStore = Store(CouchDbStore(testStoreOptions));

    var testDoc = {
        id: uuid.v4(),
        type: 'test'
    };

    return couchStore.save(testDoc)
        .then(function(doc){
            return doc.id;
        });
}

function putAttachment(docId){
    return attachmentsModule.setAttachment(docId, testAttachmentName, textMimeType, testAttachmentContent);
}

function putAttachmentWithCategory(docId){
    return attachmentsModule.setAttachment(docId, testAttachmentName, textMimeType, testAttachmentContent, testAttachmentCategory);
}

function expectCouchAttachmentResult(attachmentResult){
    return expect(attachmentResult).to.satisfy(couchAttachmentResponse);

    function couchAttachmentResponse(response){
        return ( response && response.id && response.ok && response.rev );
        //response.id should === document id
    }
}

function getAttachment(attachmentResult){
    var docId = attachmentResult.id;
    return attachmentsModule.getAttachment(docId, testAttachmentName);
}

function getAttachmentWithCategory(attachmentResult){
    var docId = attachmentResult.id;
    return attachmentsModule.getAttachment(docId, testAttachmentName, testAttachmentCategory);
}

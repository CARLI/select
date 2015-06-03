var chai = require( 'chai' );
var expect = chai.expect;
var couchUtils = require('../Store/CouchDb/Utils')();
var testUtils = require('./utils');
var Q = require('q');
var storeOptions = require( '../../config').storeOptions;
var uuid = require('node-uuid');

describe('Couch utilities', function () {
    describe('makeCouchDbName', function() {
        it ('should ensure generate valid couchdb names', function() {
            expect(couchUtils.makeValidCouchDbName('UPPERCASE')).to.equal('uppercase');
            expect(couchUtils.makeValidCouchDbName('Space Should Be Dash')).to.equal('space-should-be-dash');
            expect(couchUtils.makeValidCouchDbName('slash/Should/Be/Dash')).to.equal('slash-should-be-dash');
            expect(couchUtils.makeValidCouchDbName("Some characters aren\'t allowed:&*@#¥∆ø∂˜∫")).to.equal('some-characters-arent-allowed');
            expect(couchUtils.makeValidCouchDbName(testUtils.testDbMarker + '-couch-docs')).to.equal(testUtils.testDbMarker + '-couch-docs');
        });

    });
    describe('replicateFrom(source).to(target)', function () {
        it('should replicate data from one local database to another', function() {
            var sourceDbName = testUtils.testDbMarker + '-replication-source-db';
            var targetDbName = testUtils.testDbMarker + '-replication-target-db';
            var testDocId = 'test-replication-document';

            return couchUtils.createDatabase(sourceDbName)
                .then(function () {
                    return couchUtils.couchRequest({
                        url: storeOptions.privilegedCouchDbUrl + '/' + sourceDbName + '/' + testDocId,
                        method: 'put',
                        json: { id: testDocId }
                    });
                })
                .then(function() {
                    return couchUtils.createDatabase(targetDbName);
                })
                .then(function() {
                    return couchUtils.replicateFrom(sourceDbName).to(targetDbName);
                })
                .then(function() {
                    var requestPromise = couchUtils.couchRequest({
                        url: storeOptions.privilegedCouchDbUrl + '/' + targetDbName + '/' + testDocId,
                        method: 'get'
                    });
                    return expect(requestPromise).to.be.fulfilled
                        .and.eventually.be.an('object')
                        .and.have.property('id').equal(testDocId);
                });
        });
    });

    describe('getCouchDocuments', function(){
        it('should return documents for a set of ids', function(){
            var testDbName = testUtils.testDbMarker + '-couch-docs';
            var testIds = [ uuid.v4(), uuid.v4(), uuid.v4() ];

            return couchUtils.createDatabase(testDbName)
                .then(function () {
                    return couchUtils.couchRequest({
                        url: storeOptions.privilegedCouchDbUrl + '/' + testDbName + '/' + testIds[0],
                        method: 'put',
                        json: { id: testIds[0] }
                    });
                })
                .then(function () {
                    return couchUtils.couchRequest({
                        url: storeOptions.privilegedCouchDbUrl + '/' + testDbName + '/' + testIds[1],
                        method: 'put',
                        json: { id: testIds[1] }
                    });
                })
                .then(function () {
                    return couchUtils.couchRequest({
                        url: storeOptions.privilegedCouchDbUrl + '/' + testDbName + '/' + testIds[2],
                        method: 'put',
                        json: { id: testIds[2] }
                    });
                })
                .then(function(){
                    return expect( couchUtils.getCouchDocuments(testDbName,testIds)).and.eventually.be.an('array')
                        .and.have.property('length').equal(testIds.length);
                });
        });
    });

    describe('couchViewUrl', function(){
        var testDbName = 'testDb';
        var testViewName = 'testView';
        var testUrl = storeOptions.couchDbUrl + '/' + testDbName + '/' + '_design/CARLI/_view/' + testViewName;

        it('should return the base for the correct database and view if given no additional arguments', function(){
            expect(couchUtils.couchViewUrl(testDbName, testViewName)).to.equal(testUrl);
        });

        it ('should return the base url with a quoted key in the query string if given a key', function() {
            var testKey = 'testKey';
            var urlWithKey = testUrl + '?key=%22' + testKey + '%22';

            expect(couchUtils.couchViewUrl(testDbName, testViewName, testKey)).to.equal(urlWithKey);
        });

        it ('should return the base url with an unquoted key in the query string if given an integer key', function() {
            var testKey = 1;
            var urlWithKey = testUrl + '?key='+testKey;

            expect(couchUtils.couchViewUrl(testDbName, testViewName, testKey)).to.equal(urlWithKey);
        });

        it ('should return the base url with group=true in the query string if given a truthy group argument', function() {
            var urlWithGroup = testUrl + '?group=true';
            expect(couchUtils.couchViewUrl(testDbName, testViewName, null, true)).to.equal(urlWithGroup);
        });

        it ('should return the base url with both a quoted key and the group=true in the query string if given both a key and group arguments', function() {
            var testKey = 'testKey';
            var urlWithKeyAndGroup = testUrl + '?key=%22' + testKey + '%22&group=true';

            expect(couchUtils.couchViewUrl(testDbName, testViewName, testKey, true)).to.equal(urlWithKeyAndGroup);
        });


    });
});

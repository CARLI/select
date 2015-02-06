var chai = require( 'chai' );
var expect = chai.expect;
var couchUtils = require('../Store/CouchDb/Utils');
var testUtils = require('./utils');
var Q = require('q');
var storeOptions = require( '../../config').storeOptions;

describe('Couch utilities', function () {
    describe('makeCouchDbName', function() {
        it ('should ensure generate valid couchdb names', function() {
            expect(couchUtils.makeValidCouchDbName('UPPERCASE')).to.equal('uppercase');
            expect(couchUtils.makeValidCouchDbName('Space Should Be Dash')).to.equal('space-should-be-dash');
            expect(couchUtils.makeValidCouchDbName('slash/Should/Be/Dash')).to.equal('slash-should-be-dash');
            expect(couchUtils.makeValidCouchDbName("Some characters aren\'t allowed:&*@#¥∆ø∂˜∫")).to.equal('some-characters-arent-allowed');
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
                        url: storeOptions.couchDbUrl + '/' + sourceDbName + '/' + testDocId,
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
                        url: storeOptions.couchDbUrl + '/' + targetDbName + '/' + testDocId,
                        method: 'get'
                    });
                    return expect(requestPromise).to.be.fulfilled
                        .and.eventually.be.an('object')
                        .and.have.property('id').equal(testDocId);
                });
        });
    });
});

var chai = require( 'chai' );
var expect = chai.expect;
var CouchUtils = require('../Store/CouchDb/Utils');

describe('Couch utilities', function () {
    describe('makeCouchDbName', function() {
        it ('should ensure generate valid couchdb names', function() {
            expect(CouchUtils.makeValidCouchDbName('UPPERCASE')).to.equal('uppercase');
            expect(CouchUtils.makeValidCouchDbName('Space Should Be Dash')).to.equal('space-should-be-dash');
            expect(CouchUtils.makeValidCouchDbName('slash/Should/Be/Dash')).to.equal('slash-should-be-dash');
            expect(CouchUtils.makeValidCouchDbName("Some characters aren\'t allowed:&*@#¥∆ø∂˜∫")).to.equal('some-characters-arent-allowed');
        });

    });
});

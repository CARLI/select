var chai   = require( 'chai' )
  , expect = chai.expect
  , CARLI  = require( '../../CARLI' )
;

describe( 'CARLI', function() {

    it( 'should be a module', function() {
        expect(CARLI).to.be.an('Object');
    } );

    it( 'should export the Vendor module', function() {
        expect(CARLI.Vendor).to.be.an('Object');
    } );

    it( 'should export the Library module', function() {
        expect(CARLI.Library).to.be.an('Object');
    } );

    it( 'should export the License module', function() {
        expect(CARLI.License).to.be.an('Object');
    } );

    it( 'should export the Product module', function() {
        expect(CARLI.Product).to.be.an('Object');
    } );

    it( 'should export the Offering module', function() {
        expect(CARLI.Offering).to.be.an('Object');
    } );

    it( 'should export a Store Interface', function() {
        expect(CARLI.Store).to.be.a('Function');
    } );

    it( 'should export the MemoryStore module', function() {
        expect(CARLI.MemoryStore).to.be.a('Function');
    } );

    it( 'should export the FileStore module', function() {
        expect(CARLI.FileStore).to.be.a('Function');
    } );

    it( 'should export the Validator module', function() {
        expect(CARLI.Validator).to.be.an('Object');
    } );

    it( 'should export the Cycle module', function() {
        expect(CARLI.Cycle).to.be.an('Object');
    } );

    it( 'should export the NotificationTemplate module', function() {
        expect(CARLI.NotificationTemplate).to.be.an('Object');
    } );

    it( 'should export the Notification module', function() {
        expect(CARLI.Notification).to.be.an('Object');
    } );

    it( 'should export the NotificationDraftGenerator module', function() {
        expect(CARLI.NotificationDraftGenerator).to.be.an('Object');
    } );
} );

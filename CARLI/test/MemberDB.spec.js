var chai = require('chai')
    , chaiAsPromised = require('chai-as-promised')
    , expect = chai.expect
    , MemberDB = require('../MemberDB')
    ;

chai.use(chaiAsPromised);

describe('The Member Database Adaptor', function () {
    it('should expose a listLibraries method', function () {
        return expect(MemberDB.listLibraries).to.be.a('function');
    });

    describe('MemberDB.listLibraries', function () {
        it('should return an array', function () {
            return expect(MemberDB.listLibraries()).to.eventually.be.an('Array');
        });
        it('should have some things in it', function () {
            return MemberDB.listLibraries().then(function (libraries) {
                return expect(libraries.length).to.be.above(0);
            });
        });
        it('should have a library in it', function () {
            return MemberDB.listLibraries().then(function (libraries) {
                return expect(libraries[0]).to.have.property('member_id');
            });
        });
    })
});

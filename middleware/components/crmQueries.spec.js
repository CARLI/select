var chai = require('chai')
    , chaiAsPromised = require('chai-as-promised')
    , expect = chai.expect
    , MemberDB = require('../MemberDB')
    , Q = require('q')
    , Validator = require('../Validator')
    ;

chai.use(chaiAsPromised);

describe('The Member Database Adaptor', function () {
    it('should expose a listLibraries method', function () {
        return expect(MemberDB.listLibraries).to.be.a('function');
    });

    describe('MemberDB.listLibraries', function () {
        var listPromise = MemberDB.listLibraries();
        it('should return an array', function () {
            return expect(listPromise).to.eventually.be.an('Array');
        });
        it('should have some things in it', function () {
            return listPromise.then(function (libraries) {
                return expect(libraries.length).to.be.above(0);
            });
        });
        it('All libraries should have a valid schema', function () {
            var deferred = Q.defer();
            listPromise.then(function (libraries) {
                var promises = [];
                for (var i = 0; i < libraries.length; i++) {
                    promises.push( expect(Validator.validate(libraries[0])).to.be.fulfilled );
                }
                Q.all(promises).then(
                    function() { deferred.resolve(); },
                    function() { deferred.reject(); }
                );
            });
            return deferred.promise;
        });
    })
});

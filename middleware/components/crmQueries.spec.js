var chai = require('chai')
    , chaiAsPromised = require('chai-as-promised')
    , expect = chai.expect
    , crm = require('./crmQueries')
    , Q = require('q')
    , Validator = require('../../CARLI/Validator')
    ;

chai.use(chaiAsPromised);

describe('The CRM Adaptor', function () {
    it('should expose a listLibraries method', function () {
        return expect(crm.listLibraries).to.be.a('function');
    });

    describe('crmQueries.listLibraries', function () {
        var listPromise = crm.listLibraries();
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

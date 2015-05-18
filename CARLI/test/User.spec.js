var chai   = require( 'chai' );
var expect = chai.expect;
var test = require( './Entity/EntityInterface.spec' );
var vendorRepository = require('../Entity/UserRepository' );

function validUserData() {
    return {
        type: 'Vendor',
        name: 'foo'
    };
}

function invalidUserData() {
    return {
        type: 'Vendor'
    };
}

test.run('Vendor', validUserData, invalidUserData);

describe('getVendorsById', function(){
    it('should be a function', function(){
        expect(vendorRepository.getVendorsById).to.be.a('function');
    })
});

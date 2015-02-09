var chai   = require( 'chai' );
var expect = chai.expect;
var test = require( './Entity/EntityInterface.spec' );
var vendorRepository = require('../Entity/VendorRepository' );

function validVendorData() {
    return {
        type: 'Vendor', 
        name: 'foo' 
    };
}

function invalidVendorData() {
    return {
        type: 'Vendor'
    };
}

test.run('Vendor', validVendorData, invalidVendorData);

describe('getVendorsById', function(){
    it('should be a function', function(){
        expect(vendorRepository.getVendorsById).to.be.a('function');
    })
});
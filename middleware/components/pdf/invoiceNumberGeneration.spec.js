var chai = require('chai')
var expect = chai.expect;
var incrementInvoiceNumber = require('./invoiceNumberGeneration').incrementInvoiceNumber;
var Q = require('q');

describe('The invoiceNumber generation algorithm', function () {
    it('should increment the first two characters as digits', function () {
        expect(incrementInvoiceNumber('00AA')).to.equal('01AA');
        expect(incrementInvoiceNumber('10AA')).to.equal('11AA');
        expect(incrementInvoiceNumber('77AA')).to.equal('78AA');
    });

    it('should increment the third character as a letter when the first two pass 99', function () {
        expect(incrementInvoiceNumber('99AA')).to.equal('00BA');
    });

    it('should increment the fourth character as a letter when the third passes Z', function () {
        expect(incrementInvoiceNumber('99ZA')).to.equal('00AB');
    });

    it('should reset to 00AA if the fourth character passes Z', function () {
        expect(incrementInvoiceNumber('99ZZ')).to.equal('00AA');
    });
});
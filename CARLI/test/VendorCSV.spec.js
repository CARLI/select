var expect = require('chai').expect;
var vendorCSVModule = require('../VendorCSV');

describe('The VendorCSV Module', function () {
    it('should be a object', function () {
        expect(vendorCSVModule).to.be.an('object');
    });

    it('should have a function called generateSiteLicensePriceCsv', function () {
        expect(vendorCSVModule.generateSiteLicensePriceCsv).to.be.a('function');
    });

    it('should export an object suitable for exporting to CSV', function () {
        var testViewOptions = {
            priceCap: true,
            size: true,
            type: true,
            years: true
        };

        var testProducts = [
            {
                id: 'p1',
                name: 'Product1',
                priceCap: 11
            },
            {
                id: 'p2',
                name: 'Product2',
                priceCap: 22
            }
        ];

        var testLibraries = [
            {
                id: 'l1',
                name: 'Library1',
                fte: 1,
                institutionType: 'Type',
                institutionYears: '4'
            },
            {
                id: 'l2',
                name: 'Library2',
                fte: 2,
                institutionType: 'Type',
                institutionYears: '2'
            }
        ];

        var testOfferings = {
            p1: {
                l1: {pricing: {site: 100}},
                l2: {pricing: {site: 200}}
            },
            p2: {
                l1: {pricing: {site: 300}},
                l2: {pricing: {site: 400}}
            }
        };

        var testResults = vendorCSVModule.generateSiteLicensePriceCsv(testViewOptions, testProducts, testLibraries, testOfferings);

        var expectedResultsRowZero = {
            Library: 'Price Caps',
            Product1: 11,
            Product2: 22,
            Size: '',
            Type: '',
            Years: ''
        };

        var expectedResultsRowOne = {
            Library: 'Library1',
            Product1: 100,
            Product2: 300,
            Size: 1,
            Type: 'Type',
            Years: '4'
        };

        var expectedResultsRowTwo = {
            Library: 'Library2',
            Product1: 200,
            Product2: 400,
            Size: 2,
            Type: 'Type',
            Years: '2'
        };

        expect(testResults).to.be.an('array').and.have.length(3);
        expect(testResults[0]).to.deep.equal(expectedResultsRowZero);
        expect(testResults[1]).to.deep.equal(expectedResultsRowOne);
        expect(testResults[2]).to.deep.equal(expectedResultsRowTwo);
    });
});

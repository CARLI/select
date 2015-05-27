var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , moment = require('moment')
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , ProductRepository = require('../Entity/ProductRepository' )
    , VendorRepository = require('../Entity/VendorRepository' )
    , testUtils = require('./utils')
    , _ = require('lodash')
    , Q = require('q')
    ;

var testCycleId = uuid.v4();

function validVendorStatusData() {
    return {
        type: 'VendorStatus',
        id: uuid.v4(),
        vendor: uuid.v4(),
        cycle: testCycleId
    };
}
function invalidVendorStatus() {
    return {
        type: 'VendorStatus'
    };
}

function testCycleData() {
    return {
        id: testCycleId,
        idalId: 200,
        name: testUtils.testDbMarker + ' VendorStatus Tests 2014',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    };
}


describe('Run the VendorStatus tests', function () {
    it ('runs VendorStatus tests', function (done) {
        return CycleRepository.create(testCycleData())
            .then(CycleRepository.load)
            .then(function (testCycle) {
                test.run('VendorStatus', validVendorStatusData, invalidVendorStatus, testCycle);
                runVendorStatusSpecificTests(testCycle);
                done();
            });
    });
});


function runVendorStatusSpecificTests(testCycle) {
}

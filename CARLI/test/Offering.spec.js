var chai   = require( 'chai' )
    , config = require('../../config')
    , expect = chai.expect
    , uuid   = require( 'node-uuid' )
    , chaiAsPromised = require( 'chai-as-promised' )
    , test = require( './Entity/EntityInterface.spec' )
    , CycleRepository = require('../Entity/CycleRepository' )
    , testUtils = require('./utils')
    ;

chai.use( chaiAsPromised );

var testCycleId = uuid.v4();

function validOfferingData() {
    return {
        type: 'Offering',
        cycle: { id: testCycleId },
        library: { id: uuid.v4() },
        product: { id: uuid.v4() },
        pricing: {
            site: 1200,
            su: [{
                users: 2,
                price: 700
            }]
        }
    };
}
function invalidOfferingData() {
    return {
        type: 'Offering'
    };
}
function testCycleData() {
    return {
        id: testCycleId,
        idalId: 200,
        name: testUtils.testDbMarker + ' Offering Tests',
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        OfferingsAvailableDate: '2014-01-01'
    };
}

describe('Run the Offering tests', function () {
    it ('runs Offering tests', function (done) {
        return CycleRepository.create(testCycleData())
            .then(CycleRepository.load)
            .then(function (testCycle) {
                test.run('Offering', validOfferingData, invalidOfferingData, testCycle);
                //runOfferingSpecificTests(testCycle);
                done();
            }).done();
    });
});


function runOfferingSpecificTests(testCycle) {
    describe('Offering Specific Tests', function () {
    });
}

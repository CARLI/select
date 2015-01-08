var test = require( './Entity/EntityInterface.spec' ) 
;

function validCycleData() {
    return {
        type: 'Cycle', 
        name: 'Fiscal Year 3001',
        cycleType: 'Fiscal Year',
        year: 3001
    };
}

function invalidCycleData() {
    return {
        type: 'Cycle'
    };
}

test.run('Cycle', validCycleData, invalidCycleData);

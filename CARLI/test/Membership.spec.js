var chai = require('chai');
var expect = chai.expect;
var test = require('./Entity/EntityInterface.spec');
var testUtils = require('./utils');

testUtils.setupTestDb();

function validMembershipData() {
    return {
        type: 'Membership',
        year: 2000
    };
}

function invalidMembershipData() {
    return {
        type: 'Membership'
    };
}

test.run('Membership', validMembershipData, invalidMembershipData);

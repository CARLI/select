var chai = require('chai');
var expect = chai.expect;
var membershipRepository = require('../Entity/MembershipRepository');
var test = require('./Entity/EntityInterface.spec');
var testUtils = require('./utils');

testUtils.setupTestDb();

function validMembershipData() {
    return {
        type: 'Membership',
        year: 2000,
        data: {
            1: {
                ishare: 100,
                membership: 110
            },
            2: {
                ishare: 200,
                membership: 220
            },
            3: {
                ishare: 300,
                membership: 330
            }
        }
    };
}

function invalidMembershipData() {
    return {
        type: 'Membership'
    };
}

test.run('Membership', validMembershipData, invalidMembershipData);

describe('the listOfferingsWithDuesForYear', function(){
    it('should be a function', function(){
        expect(membershipRepository.listLibrariesWithDues).to.be.a('function');
    });

    it('should return an array of library ids', function(){
        var testMembershipData = validMembershipData();
        testMembershipData.data['4'] = {};

        var testIds = membershipRepository.listLibrariesWithDues( testMembershipData );
        expect(testIds).to.be.an('array');
        expect(testIds.length).to.equal(3);
    });
});

describe('the getMembershipDuesAsOfferings method', function(){
    it('should be a function', function(){
        expect(membershipRepository.getMembershipDuesAsOfferings).to.be.a('function');
    });

    it('should return an array of fake offerings', function(){
        var testOfferings = membershipRepository.getMembershipDuesAsOfferings( validMembershipData() );
        expect(testOfferings).to.be.an('array');

        var offering0 = testOfferings[0];
        expect(offering0.library).to.have.property('id', '1');
        expect(offering0.cycle).to.have.property('year', 2000);
        expect(offering0.pricing).to.have.property('ishare', 100);
    });
});
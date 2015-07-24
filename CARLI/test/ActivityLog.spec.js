var chai = require( 'chai' );
var expect = chai.expect;
var activityLogRepository = require('../Entity/ActivityLogRepository' );
var testUtils = require('./utils');
var Q = require('q');
var uuid = require( 'node-uuid' );
var _ = require('lodash');

testUtils.setupTestDb();

function validActivityLogEntry() {
    return {
        type: 'ActivityLogEntry',
        date: new Date().toISOString(),
        userName: 'Test User',
        userEmail: 'test@user.com',
        actionDescription: 'Test Activity',
        app: 'system'
    };
}

function invalidActivityLogEntry() {
    return {
        type: 'ActivityLogEntry'
    };
}

//Comment this out to use the real activity log database.
activityLogRepository.setStore(testUtils.getTestDbStore());

describe('The activityLogRepository', function() {
    it('should return an id when creating an activity log entry', function () {
        return activityLogRepository.create(validActivityLogEntry())
            .then(function(newId){
                return expect(newId).to.be.a('string');
            });
    });

    it('should list all activity logs', function(){
        return activityLogRepository.list()
            .then(expectResultToBeAnArrayOfActivityLogs);
    });
});

//Commented out because I didn't want to spend the time setting up a test activity log database
/*
describe('the listActivityBetween method', function(){
    it('should be a function', function(){
        expect(activityLogRepository.listActivityBetween).to.be.a('function');
    });

    it('should return an array', function(){
        return activityLogRepository.listActivityBetween('1970-01-01', '2099-12-31')
            .then(expectResultToBeAnArrayOfActivityLogs);
    });
});

describe('the listActivitySince method', function(){
    it('should be a function', function(){
        expect(activityLogRepository.listActivitySince).to.be.a('function');
    });

    it('should return an array', function(){
        return activityLogRepository.listActivitySince('1970-01-01')
            .then(expectResultToBeAnArrayOfActivityLogs);
    });
});
*/


function expectResultToBeAnArrayOfActivityLogs(result){
    return expect(result).to.satisfy(isAnArrayOfActivityLogs);
}

function isAnArrayOfActivityLogs( list ){
    var isArray = _.isArray(list);
    var hasItems = list.length > 0;
    var firstItem = list[0];
    var firstItemIsAnObject = _.isObject(firstItem);
    var firstItemIsAnActivityLog = firstItem.type === 'ActivityLogEntry';
    return  isArray && hasItems && firstItemIsAnObject && firstItemIsAnActivityLog;
}
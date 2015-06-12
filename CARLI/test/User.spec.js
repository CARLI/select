var chai   = require( 'chai' );
var expect = chai.expect;
var test = require( './Entity/EntityInterface.spec' );
var userRepository = require('../Entity/UserRepository' );

//var uniqueCounter = 0;
//
//function validUserData() {
//    uniqueCounter++;
//    return {
//        id: 'org.couchdb.user:foo' + uniqueCounter,
//        type: 'user',
//        name: 'foo' + uniqueCounter,
//        email: 'foo@hotmail.com',
//        roles: [ 'staff' ]
//    };
//}
//
//function invalidUserData() {
//    return {
//        type: 'user'
//    };
//}
//
//test.run('User', validUserData, invalidUserData);

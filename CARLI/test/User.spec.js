var chai   = require( 'chai' );
var expect = chai.expect;
var test = require( './Entity/EntityInterface.spec' );
var userRepository = require('../Entity/UserRepository' );

function validUserData() {
    return {
        type: 'user',
        name: 'foo',
        email: 'foo@hotmail.com',
        roles: [ 'staff' ]
    };
}

function invalidUserData() {
    return {
        type: 'user'
    };
}

test.run('User', validUserData, invalidUserData);

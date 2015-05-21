
var auth = require('../../CARLI/Auth');

function createSession(userLogin) {
    return auth.createSession(userLogin);
}

module.exports = {
    createSession: createSession
};

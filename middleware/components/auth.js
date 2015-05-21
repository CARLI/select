
var auth = require('../../CARLI/Auth');

function createSession(userLogin) {
    return auth.createSession(userLogin);
}

function deleteSession() {
    return auth.deleteSession();
}

module.exports = {
    createSession: createSession,
    deleteSession: deleteSession
};

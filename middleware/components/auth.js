
var auth = require('../../CARLI/Auth');

module.exports = {
    createSession: auth.createSession,
    deleteSession: auth.deleteSession,
    getSession: auth.getSession,
    masqueradeAsLibrary: auth.masqueradeAsLibrary
};

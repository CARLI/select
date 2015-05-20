
var auth = require('../../CARLI/Auth');

function logIn(user) {
    return auth.logIn(user);
}

module.exports = {
    logIn: logIn
};

var Q = require('q');
var readline = require('readline');

var auth = require('../CARLI/Auth');
var config = require('../config');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function asCouchAdmin(doSomething) {
    return loginToCouch()
        .then(doSomething)
        .catch(logError)
        .finally(logoutOfCouch);
}

function loginToCouch() {
    return auth.createSession({
        email: config.storeOptions.privilegedCouchUsername,
        password: config.storeOptions.privilegedCouchPassword
    });
}

function logoutOfCouch() {
    auth.deleteSession();
}

function logError(error) {
    console.log(error);
}

function confirmOrExit(question) {
    var deferred = Q.defer();

    rl.question(question, fulfillPromise);
    return deferred.promise;

    function fulfillPromise(answer) {
        if (userSaidYes()) {
            deferred.resolve();
        } else {
            process.exit();
        }

        function userSaidYes() {
            return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
        }
    }
}

module.exports = {
    asCouchAdmin: asCouchAdmin,
    loginToCouch: loginToCouch,
    logoutOfCouch: logoutOfCouch,
    logError: logError,
    confirmOrExit: confirmOrExit
};

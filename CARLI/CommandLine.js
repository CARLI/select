var Q = require('q');
var path = require('path');
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
        .finally(logoutOfCouch)
        ;//.finally(terminateProcess);
}

function loginToCouch() {
    return auth.createSession({
        email: config.storeOptions.privilegedCouchUsername,
        password: config.storeOptions.privilegedCouchPassword
    });
}

function logoutOfCouch() {
    return auth.deleteSession().then(function (r) {
        return r;
    });
}

function terminateProcess() {
    process.exit();
}

function logError(error) {
    Logger.log(error);
    return error;
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

function withSingleArgument(argumentName, doSomething) {
    var argument = getFirstArgument();

    if (!argument)
        showUsageAndExit();

    return doSomething(argument);

    function getFirstArgument() {
        return process.argv[2];
    }
    function showUsageAndExit() {
        console.log('Usage: ' + getProgramName() + ' <'+ argumentName +'>');
        process.exit();

        function getProgramName() {
            return path.basename(process.argv[1]);
        }
    }
}

module.exports = {
    asCouchAdmin: asCouchAdmin,
    confirmOrExit: confirmOrExit,
    loginToCouch: loginToCouch,
    logoutOfCouch: logoutOfCouch,
    logError: logError,
    withSingleArgument: withSingleArgument
};

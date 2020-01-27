var Q = require('q');
var path = require('path');
var readline = require('readline');

var databaseAuth = require("./DatabaseAuthUtils");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function asCouchAdmin(doSomething) {
    return databaseAuth.asCouchAdmin(doSomething)
        .catch(logError)
        .finally(terminateProcess);
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

function withOptionalSingleArgument(doSomething) {
    var argument = getFirstArgument();
    return doSomething(argument);
}

function withSingleArgument(argumentName, doSomething) {
    var argument = getFirstArgument();

    if (!argument)
        showUsageAndExit();

    return withOptionalSingleArgument(doSomething);

    function showUsageAndExit() {
        console.log('Usage: ' + getProgramName() + ' <'+ argumentName +'>');
        process.exit();
    }
}

function getFirstArgument() {
    return process.argv[2];
}

function getProgramName() {
    return path.basename(process.argv[1]);
}

module.exports = {
    asCouchAdmin,
    confirmOrExit,
    withOptionalSingleArgument,
    withSingleArgument,
    getProgramName,
};


function Logger() {
    function log() {
        var argsArray = prependTimestampToArguments(arguments);
        console.log.apply(console, argsArray);
    }

    function prependTimestampToArguments(args) {
        var argsArray = Array.prototype.slice.call(args);
        argsArray.unshift('[' + getTimestamp() + ']');
        return argsArray;
    }

    function getTimestamp() {
        return new Date().toISOString();
    }

    function printStackTrace() {
        var e = new Error();
        log(e.stack);
    }

    return {
        debug: log,
        error: log,
        log: log,
        warning: log,
        printStackTrace: printStackTrace
    };
}

module.exports = Logger();

var INSTANT_TIMEOUT = -1;
var INFINITE_TIMEOUT = Infinity;

function createCache(timeout) {
    var cache = {};
    var timeToLive = timeout || INSTANT_TIMEOUT;

    function timestamp() {
        return new Date().getTime();
    }

    function cacheIsExpired(entry) {
        var now = timestamp();
        return (now - entry.timestamp > timeToLive);
    }


    return {
        add: function(data) {
            if ( data.id ){
                cache[data.id] = { timestamp: timestamp(), data: data };
            }
        },
        delete: function(id) {
            cache[id] = null;
        },
        get: function(id) {
            if (cache[id]) {
                return cacheIsExpired(cache[id]) ? null : cache[id].data;
            }
            return null;
        }
    };
}

module.exports = {
    INFINITE_TIMEOUT: INFINITE_TIMEOUT,
    INSTANT_TIMEOUT: INSTANT_TIMEOUT,
    createCache: createCache
};

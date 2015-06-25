var Q = require('q');

function _cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}


module.exports = function () {
    var memoryStore = {};

    return {
        getOptions: noOp,
        getDataFor: getDataFor,
        storeData: storeData,
        listDataFor: listDataFor,
        deleteDataFor: deleteDataFor
    };


    function getDataFor(id) {
        var deferred = Q.defer();

        if (memoryStore[id]) {
            deferred.resolve(_cloneData(memoryStore[id]));
        }
        else {
            deferred.reject({error:'not_found'});
        }

        return deferred.promise;
    }

    function storeData(data) {
        var deferred = Q.defer();

        memoryStore[ data.id ] = data;
        deferred.resolve(_cloneData(data));

        return deferred.promise;
    }

    function listDataFor(type) {
        var deferred = Q.defer();

        var promises = [];

        for (id in memoryStore) {
            if (memoryStore[id].type === type) {
                promises.push(getDataFor(id));
            }
        }

        Q.all(promises).then(function (objects) {
            deferred.resolve(objects);
        });

        return deferred.promise;
    }

    function deleteDataFor(id) {
        var deferred = Q.defer();

        if (memoryStore[id]) {
            delete memoryStore[id];
            deferred.resolve();
        }
        else {
            deferred.reject('not_found');
        }

        return deferred.promise;
    }

    function noOp(){}
};

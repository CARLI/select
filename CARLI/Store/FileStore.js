var fs = require('fs');
var Q = require('q');

function _cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function _ensureStoreDirectoryExists(path) {
    try {
        fs.mkdirSync(path, '0777')
    }
    catch (err) {
        if (err.code !== 'EEXIST') {
            throw new Error(err);
        }
    }
}

module.exports = function (options) {
    var resourcePath = options.resourcePath;

    _ensureStoreDirectoryExists(resourcePath);

    return {
        getDataFor: getDataFor,
        storeData: storeData,
        listDataFor: listDataFor,
        deleteDataFor: deleteDataFor
    };


    function getDataFor(id) {
        var deferred = Q.defer();

        fs.readFile(resourcePath + '/' + id + '.json', function (err, data) {
            if (err) {
                deferred.reject({error:'not_found'});
            }
            else {
                deferred.resolve(JSON.parse(data));
            }
        });

        return deferred.promise;
    }

    function storeData(data) {
        var deferred = Q.defer();

        fs.writeFile(
            resourcePath + '/' + data.id + '.json', JSON.stringify(data), function (err) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(_cloneData(data));
                }
            }
        );

        return deferred.promise;
    }

    function listDataFor(type) {
        var deferred = Q.defer();

        fs.readdir(resourcePath + '/', function (err, files) {
            if (err) {
                deferred.resolve([]);
            }
            else {
                var promises = [];
                files.forEach(function (id) {
                    promises.push(getDataFor(id.slice(0, -5)));
                });
                Q.all(promises).then(function (list) {
                    var listByType = list.filter(function (entity) {
                        return entity.type && entity.type === type;
                    });
                    deferred.resolve(listByType);
                });
            }
        });

        return deferred.promise;
    }

    function deleteDataFor(id) {
        var deferred = Q.defer();

        fs.unlink(resourcePath + '/' + id + '.json', function (err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    }
};

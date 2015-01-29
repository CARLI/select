var config = require('../config');
var request = require('../config/environmentDependentModules').request;
var Q = require('q');

var dbInfo = {
    local: {
        baseUrl: config.storeOptions.couchDbUrl,
        mainDbName: config.storeOptions.couchDbName,
        mainDbUrl: config.storeOptions.couchDbUrl + '/' + config.storeOptions.couchDbName
    },
    qa: {
        baseUrl: 'http://carli-db.qa.pixotech.com',
        mainDbName: 'carli',
        mainDbUrl: 'http://carli-db.qa.pixotech.com/carli'
    }
};

function replicateFrom(sourceUrl) {
    return {
        to: function (targetUrl) {
            var deferred = Q.defer();

            request({
                url: dbInfo.local.baseUrl + '/_replicate',
                method: 'post',
                json: {
                    source: sourceUrl,
                    target: targetUrl
                }
            }, handleResponse);

            function handleResponse(error, response, body) {
                if (error) {
                    deferred.reject(error);
                } else {
                    if (body.ok) {
                        console.log("OK: Replicated " + sourceUrl + " to " + targetUrl);
                        deferred.resolve();
                    } else if (body.error == 'db_not_found') {
                        createDb(targetUrl).then(function() {
                            return deferred.resolve(replicateFrom(sourceUrl).to(targetUrl));
                        });
                    } else {
                        deferred.reject(body);
                    }
                }
            }

            return deferred.promise;
        }
    }
}

function replicateAllFrom(source) {
    return {
        to: function (target) {

            var listCycleDbs = generateCycleDbLister(source);
            var replicateCycleDbs = generateCycleDbReplicator(source, target);

            return replicateFrom(dbInfo[source].mainDbUrl).to(dbInfo[target].mainDbUrl)
                .then(listCycleDbs)
                .then(replicateCycleDbs);
        }
    };
}

function generateCycleDbReplicator(source, target) {
    return function (cycleDbs) {
        console.log("Replicating " + cycleDbs.length + " Cycle Databases from " + source + " to " + target);

        var promises = [];
        cycleDbs.forEach(function (cycleDb) {
            var sourceUrl = dbInfo[source].baseUrl + '/' + cycleDb;
            var targetUrl = dbInfo[target].baseUrl + '/' + cycleDb;
            promises.push(replicateFrom(sourceUrl).to(targetUrl));
        });
        return Q.all(promises);
    }
}

function generateCycleDbLister(source) {
    return function() {
        var deferred = Q.defer();
        var listCycleDocsUrl = dbInfo[source].mainDbUrl + '/_design/CARLI/_view/listByType?key="Cycle"';

        console.log(listCycleDocsUrl);

        request({
            url: listCycleDocsUrl,
            method: 'get',
            json: true
        }, function(error, response, body) {
            if (error || body.error) {
                deferred.reject(error || body.error);
            } else {
                var cycleDbs = [];
                body.rows.forEach(function (row) {
                    if (row.value.databaseName) {
                        cycleDbs.push(row.value.databaseName);
                    }
                });
                deferred.resolve(cycleDbs);
            }
        });

        return deferred.promise;
    };
}

function createDb(targetUrl) {
    var deferred = Q.defer();
    request({
        url: targetUrl,
        method: 'put',
        json: true
    }, function(error, response, body) {
        if (error || body.error) {
            deferred.reject(error || body.error);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function replicateQaToLocal() {
    replicateAllFrom('qa').to('local')
        .then(function() {
            console.log("Finished");
        })
        .catch(function (error) {
            console.log(error);
        })
        .done();
}

function replicateLocalToQa() {
    replicateAllFrom('local').to('qa')
        .then(function() {
            console.log("Finished");
        })
        .catch(function (error) {
            console.log(error);
        })
        .done();
}

module.exports = {
    replicateQaToLocal: replicateQaToLocal,
    replicateLocalToQa: replicateLocalToQa
};

if (require.main === module) {
    replicateQaToLocal();
}

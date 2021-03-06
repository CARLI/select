var request = require('request');
var Q = require('q');

var dbInfo = require('./databaseInfo');

function replicator(sourceUrl) {
    var replicateWhat = 'content';
    var requestInfo = {
        url: dbInfo.local.baseUrl + '/_replicate',
        method: 'post',
        json: {}
    };
    var _replicator = {
        from: setSource,
        to: setTarget,
        designDocsOnly: setDesignDocIdsOnly,
        replicate: triggerReplication
    };

    function setSource(sourceUrl) {
        requestInfo.json.source = sourceUrl;
        return _replicator;
    }

    function setTarget(targetUrl) {
        requestInfo.json.target = targetUrl;
        return _replicator;
    }

    function setDesignDocIdsOnly() {
        replicateWhat = 'design docs';
        requestInfo.doc_ids = [ "_design/CARLI" ];
        return _replicator;
    }

    function triggerReplication() {
        var deferred = Q.defer();

        request(requestInfo, handleResponse);

        function handleResponse(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (body.ok) {
                    Logger.log("OK: Replicated " + replicateWhat + " of " + requestInfo.json.source + " to " + requestInfo.json.target);
                    deferred.resolve();
                } else if (body.error == 'db_not_found') {
                    createDb(requestInfo.json.target).then(function() {
                        return deferred.resolve(triggerReplication() );
                    });
                } else {
                    deferred.reject(body);
                }
            }
        }

        return deferred.promise;
    }

    return _replicator;
}

function replicateAllFrom(source) {
    return {
        to: function (target) {

            var listCycleDbs = generateCycleDbLister(source);
            var replicateCycleDbs = generateCycleDbReplicator(source, target);

            return replicateMainDb()
                .then(replicateUserResetDb)
                .then(listCycleDbs)
                .then(replicateCycleDbs);

            function replicateMainDb() {
                return replicator().from(dbInfo[source].mainDbUrl).to(dbInfo[target].mainDbUrl).replicate();
            }
            function replicateUserResetDb() {
                return replicator().from(dbInfo[source].baseUrl + '/user-reset-requests').to(dbInfo[target].baseUrl + '/user-reset-requests').replicate();
            }
        }
    };
}

function replicateDesignDocsFrom(source) {
    return {
        to: function (target) {
            var listCycleDbs = generateCycleDbLister(source);
            var replicateCycleDesignDocs = generateCycleDbDesignDocReplicator(source, target);

            return replicateMainDesignDoc()
                .then(replicateUserDesignDoc)
                .then(replicateResetRequestDesignDoc)
                .then(replicateActivityLogDesignDoc)
                .then(listCycleDbs)
                .then(replicateCycleDesignDocs);

            function replicateMainDesignDoc() {
                return replicator()
                    .designDocsOnly()
                    .from(dbInfo[source].mainDbUrl)
                    .to(dbInfo[target].mainDbUrl)
                    .replicate()
            }

            function replicateUserDesignDoc() {
                return replicator()
                    .designDocsOnly()
                    .from(dbInfo[source].baseUrl + '/_users')
                    .to(dbInfo[target].baseUrl + '/_users')
                    .replicate()
            }

            function replicateResetRequestDesignDoc() {
                return replicator()
                    .designDocsOnly()
                    .from(dbInfo[source].baseUrl + '/user-reset-requests')
                    .to(dbInfo[target].baseUrl + '/user-reset-requests')
                    .replicate()
            }

            function replicateActivityLogDesignDoc() {
                return replicator()
                    .designDocsOnly()
                    .from(dbInfo[source].baseUrl + '/activity-log')
                    .to(dbInfo[target].baseUrl + '/activity-log')
                    .replicate()
            }
        }
    }
}

function generateCycleDbReplicator(source, target) {
    return function (cycleDbs) {
        Logger.log("Replicating " + cycleDbs.length + " Cycle Databases from " + source + " to " + target);

        var promises = [];
        cycleDbs.forEach(function (cycleDb) {
            var sourceUrl = dbInfo[source].baseUrl + '/' + cycleDb;
            var targetUrl = dbInfo[target].baseUrl + '/' + cycleDb;
            promises.push(replicator().from(sourceUrl).to(targetUrl).replicate());
        });
        return Q.all(promises);
    }
}

function generateCycleDbDesignDocReplicator(source, target) {
    return function (cycleDbs) {
        Logger.log("Replicating Design Docs for " + cycleDbs.length + " Cycle Databases from " + source + " to " + target);

        var promises = [];
        cycleDbs.forEach(function (cycleDb) {
            var sourceUrl = dbInfo[source].baseUrl + '/' + cycleDb;
            var targetUrl = dbInfo[target].baseUrl + '/' + cycleDb;
            promises.push(replicator().designDocsOnly().from(sourceUrl).to(targetUrl).replicate());
        });
        return Q.all(promises);
    }
}

function generateCycleDbLister(source) {
    return function() {
        var deferred = Q.defer();
        var listCycleDocsUrl = dbInfo[source].mainDbUrl + '/_design/CARLI/_view/listByType?key="Cycle"';

        Logger.log(listCycleDocsUrl);

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
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}

function replicateLocalToQa() {
    replicateAllFrom('local').to('qa')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}
function replicateLocalDesignDocsToQa() {
    replicateDesignDocsFrom('local').to('qa')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}

function replicateLocalToDev() {
    replicateAllFrom('local').to('dev')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}
function replicateLocalDesignDocsToDev() {
    replicateDesignDocsFrom('local').to('dev')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}
function replicateDevToLocal() {
    replicateAllFrom('dev').to('local')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}

function replicateLocalToProd() {
    replicateAllFrom('local').to('prod')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}
function replicateLocalDesignDocsToProd() {
    replicateDesignDocsFrom('local').to('prod')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}
function replicateQaToProd() {
    replicateAllFrom('qa').to('prod')
        .then(function() {
            Logger.log("Finished");
        })
        .catch(function (error) {
            Logger.log(error);
        })
        .done();
}

module.exports = {
    replicateDevToLocal: replicateDevToLocal,
    replicateQaToLocal: replicateQaToLocal,
    replicateLocalToQa: replicateLocalToQa,
    replicateLocalToDev: replicateLocalToDev,
    replicateLocalToProd: replicateLocalToProd,
    replicateQaToProd: replicateQaToProd,
    replicateLocalDesignDocsToDev: replicateLocalDesignDocsToDev,
    replicateLocalDesignDocsToQa: replicateLocalDesignDocsToQa,
    replicateLocalDesignDocsToProd: replicateLocalDesignDocsToProd
};

if (require.main === module) {
    replicateQaToLocal();
}

var middlewareRequest = require('./middlewareRequest');

function create(newCycleData) {
    var request = {
        path: '/cycle',
        method: 'put',
        json: true,
        body: {
            newCycleData: newCycleData
        }
    };

    return middlewareRequest(request).then(function (response) {
        return response.id;
    });
}

function createCycleFrom(sourceCycle, newCycleData) {
    var request = {
        path: '/cycle-from',
        method: 'put',
        json: true,
        body: {
            sourceCycle: sourceCycle,
            newCycleData: newCycleData
        }
    };

    return middlewareRequest(request).then(function (response) {
        return response.id;
    });
}

function getCycleCreationStatus( cycleId ){
    var request = {
        path: '/cycle-creation-status/' + cycleId,
        method: 'get'
    };

    return middlewareRequest(request);
}

function deleteCycle(cycleId) {
    var request = {
        path: '/delete-cycle/' + cycleId,
        method: 'delete'
    };

    return middlewareRequest(request);
}

function resumeCycle(jobId) {
    var request = {
        path: '/resume-new-cycle/' + jobId,
        method: 'put'
    };

    return middlewareRequest(request);
}

module.exports = {
    create: create,
    createCycleFrom: createCycleFrom,
    getCycleCreationStatus: getCycleCreationStatus,
    deleteCycle: deleteCycle,
    resumeCycle: resumeCycle
};

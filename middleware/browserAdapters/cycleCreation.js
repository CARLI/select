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

function newCreateCycleFrom(sourceCycle, newCycleData) {
    var request = {
        path: '/new-cycle-from',
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

module.exports = {
    create: create,
    createCycleFrom: createCycleFrom,
    newCreateCycleFrom: newCreateCycleFrom,
    getCycleCreationStatus: getCycleCreationStatus,
    deleteCycle: deleteCycle
};

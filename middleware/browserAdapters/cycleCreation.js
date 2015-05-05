var middlewareRequest = require('./middlewareRequest');

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

module.exports = {
    createCycleFrom: createCycleFrom,
    getCycleCreationStatus: getCycleCreationStatus
};

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

module.exports = {
    createCycleFrom: createCycleFrom
};

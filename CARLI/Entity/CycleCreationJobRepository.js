var Entity = require('../Entity');
var config = require('../../config');
var StoreOptions = config.storeOptions;
var Store = require('../Store');
var StoreModule = require('../Store/CouchDb/Store');
var EntityTransform = require( './EntityTransformationUtils');

var baseRepository = Entity('CycleCreationJob');

baseRepository.setStore(Store(StoreModule(StoreOptions)));

var propertiesToTransform = ['sourceCycle', 'targetCycle'];

function listCycleCreationJobs() {
    return EntityTransform.expandListOfObjectsFromPersistence(baseRepository.list(), propertiesToTransform);
}

module.exports = {
    ...baseRepository,
    listCycleCreationJobs: listCycleCreationJobs
};

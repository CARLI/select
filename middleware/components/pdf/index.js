var cycleRepository = require('../../../CARLI/Entity/CycleRepository.js');
var libraryRepository = require('../../../CARLI/Entity/LibraryRepository.js');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository.js');
var Q = require('q');


function generatePdfContent(type, entityId, cycleId){
    console.log('Begin PDF content for '+type+' '+entityId+' for cycle '+cycleId);

    if ( type.toLowerCase() !== 'invoice'  &&
         type.toLowerCase() !== 'estimate' &&
         type.toLowerCase() !== 'report'
    ){
        console.log('  Error: bad type');
        return Q.reject('Invalid type for PDF content: '+type);
    }

    if ( !entityId ){
        console.log('  Error: no entityId');
        return Q.reject('Missing entity id');
    }

    if ( !cycleId ){
        console.log('  Error: no cycleId');
        return Q.reject('Missing cycle id');
    }

    return cycleRepository.load(cycleId)
        .then(function(cycle){
            console.log('  Loaded cycle '+cycle.name);
            return dataForPdf(type, entityId, cycle);
        })
        .catch(noCycle)

    ;

    function noCycle( err ){
        console.log('  ERROR loading cycle', err);
        if ( err.statusCode == 401 ){
            return Q.reject('unauthorized');
        }
        else {
            return Q.reject('No cycle found with id '+cycleId);
        }
    }
}

function dataForPdf(type, entityId, cycle){
    if ( type.toLowerCase() === 'invoice' || type.toLowerCase() === 'estimate' ){
        return dataForLibrarySelections(entityId);
    }

    if ( type.toLowerCase() === 'report' ){
        return dataForVendorReport(entityId);
    }

    return Q.reject('invalid type: '+type);

    function dataForLibrarySelections(libraryId){
        return libraryRepository.load(libraryId)
            .then(function(library){
                return {
                    cycle: cycle,
                    library: library,
                    data: {}
                }
            });
    }

    function dataForVendorReport(vendorId){
        return vendorRepository.load(vendorId)
            .then(function(vendor){
                return {
                    cycle: cycle,
                    vendor: vendor,
                    data: {}
                }
            });
    }
}






module.exports = {
    generatePdfContent: generatePdfContent
};

var cycleRepository = require('../../../CARLI/Entity/CycleRepository.js');
var libraryRepository = require('../../../CARLI/Entity/LibraryRepository.js');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository.js');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository.js');
var Q = require('q');


function generateContentForPdf(type, entityId, cycleId){
    console.log('Begin generateContentForPdf '+type+' '+entityId+' for cycle '+cycleId);

    var error = validateArguments(type, entityId, cycleId);
    if ( error ){
        return Q.reject(error);
    }

    return generateDataForPdf(type, entityId, cycleId)
        .then(htmlForPdf);

    function htmlForPdf(dataForPdf){
        if ( typeIsForLibrarySelections(type) ){
            return htmlForLibrarySelections(dataForPdf);
        }

        if ( typeIsForVendorReport(type) ){
            return htmlForVendorReport(dataForPdf);
        }

        return Q.reject('invalid type: '+type);
    }

    function htmlForLibrarySelections(dataForLibrarySelections){
        /**/return dataForLibrarySelections;
    }

    function htmlForVendorReport(dataForVendorReport){
        /**/return dataForVendorReport;
    }
}

function generateDataForPdf(type, entityId, cycleId){
    console.log('Begin generateDataForPdf '+type+' '+entityId+' for cycle '+cycleId);

    var error = validateArguments(type, entityId, cycleId);
    if ( error ){
        return Q.reject(error);
    }

    return dataForPdf();

    function dataForPdf(){
        if ( typeIsForLibrarySelections(type) ){
            return dataForLibrarySelections(entityId);
        }

        if ( typeIsForVendorReport(type) ){
            return dataForVendorReport(entityId);
        }

        return Q.reject('invalid type: '+type);
    }

    function dataForLibrarySelections(libraryId){
        var cycle = null;
        var offerings = null;

        return loadCycle(cycleId)
            .then(saveCycle)
            .then(loadSelections)
            .then(groupOfferingsForLibraryInvoice)
            .then(function(offeringsByVendor){
                offerings = offeringsByVendor;
            })
            .then(libraryRepository.load(libraryId))
            .then(function(library){
                return {
                    cycle: cycle,
                    library: library,
                    data: offerings
                }
            });

        function saveCycle(loadedCycle){
            console.log('  loaded cycle '+loadedCycle.name);
            cycle = loadedCycle;
        }

        function loadSelections(){
            return offeringRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
        }
    }

    function dataForVendorReport(vendorId){
        var cycle = null;

        return loadCycle(cycleId)
            .then(saveCycle)
            .then(vendorRepository.load(vendorId))
            .then(function(vendor){
                return {
                    cycle: cycle,
                    vendor: vendor,
                    data: {}
                }
            });

        function saveCycle(loadedCycle){
            cycle = loadedCycle;
        }
    }


    function groupOfferingsForLibraryInvoice(offeringsList){
        var offeringsByVendor = groupOfferingsByVendorId(offeringsList);
        return groupOfferingsByVendorName(offeringsByVendor);
    }

    function groupOfferingsByVendorId(offeringsList){
        var offeringsByVendor = {};

        offeringsList.forEach(function(offering){
            var vendorId = offering.vendorId;
            offeringsByVendor[vendorId] = offeringsByVendor[vendorId] || [];
            offeringsByVendor[vendorId].push(offering);
        });

        return offeringsByVendor;
    }

    function groupOfferingsByVendorName(offeringsByVendorId){
        var offeringsByVendorName = {};
        var vendorIds = Object.keys(offeringsByVendorId);

        return vendorRepository.getVendorsById(vendorIds)
            .then(function(vendors){
                vendors.forEach(function(vendor){
                    offeringsByVendorName[vendor.name] = offeringsByVendorId[vendor.id];
                });
                return offeringsByVendorName;
            });
    }
}

function validateArguments(type, entityId, cycleId) {
    if (type.toLowerCase() !== 'invoice' &&
        type.toLowerCase() !== 'estimate' &&
        type.toLowerCase() !== 'report'
    ) {
        console.log('  Error: bad type');
        return 'Invalid type for PDF content: ' + type;
    }

    if (!entityId) {
        console.log('  Error: no entityId');
        return 'Missing entity id';
    }

    if (!cycleId) {
        console.log('  Error: no cycleId');
        return 'Missing cycle id';
    }
}

function typeIsForLibrarySelections(type){
    return type.toLowerCase() === 'invoice' || type.toLowerCase() === 'estimate';
}

function typeIsForVendorReport(type){
    return type.toLowerCase() === 'report';
}

function loadCycle(cycleId){
    return cycleRepository.load(cycleId)
        .catch(noCycle);

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

module.exports = {
    generateContentForPdf: generateContentForPdf,
    generateDataForPdf: generateDataForPdf
};

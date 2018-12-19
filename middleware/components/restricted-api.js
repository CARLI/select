const cycleRepository = require('../../CARLI/Entity/CycleRepository');
const libraryRepository = require('../../CARLI/Entity/LibraryRepository');
const offeringRepository = require('../../CARLI/Entity/OfferingRepository');
const productRepository = require('../../CARLI/Entity/ProductRepository');
const userRepository = require('../../CARLI/Entity/UserRepository');
const vendorRepository = require('../../CARLI/Entity/VendorRepository');

const Q = require('q');

function listLibraries() {
    return libraryRepository.list()
        .then(translateLibraries);

    function translateLibraries( libraries ) {
        return libraries.map(translateLibrary);
    }

    function translateLibrary( library ){
        var result = {
            id: library.crmId,
            name: library.name,
            fte: library.fte,
            institutionType: library.institutionType,
            institutionYears: library.institutionYears,
            membershipLevel: library.membershipLevel
        };


        if ('isIshareMember' in library)
            result.isIshareMember = !!library.isIshareMember;
        else
            result.isIshareMember = false;

        if ('isActive' in library)
            result.isActive = !!library.isActive;
        else
            result.isActive = false;


        return result;
    }
}

function listLibraryUsers() {
    return userRepository.list()
        .then(filterOnlyLibraryUsers)
        .then(translateLibraryUsers);

    function filterOnlyLibraryUsers(users) {
        return users.filter(function (u) {
            return u.hasOwnProperty("library") &&
                u.roles.indexOf("library") >= 0;
        })
    }

    function translateLibraryUsers(users) {
        return users.map(translateLibraryUser)
    }

    function translateLibraryUser(user) {
        return {
            email: user.email,
            isActive: user.isActive,
            fullName: user.fullName,
            library: user.library,
        };
    }
}

function listCycles() {
    return cycleRepository.list()
        .then(translateCycles);

    function translateCycles(cycles) {
        return cycles.map(translateCycle)
    }

    function translateCycle(cycle) {
        return {
            id: cycle.id,
            idalId: cycle.idalId,
            name: cycle.name,
            cycleType: cycle.cycleType,
            year: cycle.year,
            isArchived: cycle.isArchived,
            startDateForSelections: cycle.startDateForSelections,
            endDateForSelections: cycle.endDateForSelections,
            productsAvailableDate: cycle.productsAvailableDate,
            databaseName: cycle.databaseName
        };
    }
}

function getSubscriptionData(cycle) {
    if (typeof cycle === 'undefined' || !cycle)
        throw "Invalid cycle database name: Use /cm/list-cycles to list valid cycles";

    var vendorNames = {};
    var libraryNames = {};
    var productNames = {};

    return cycleRepository.load(cycle)
        .then(loadNamesFromCycle)
        .then(offeringRepository.listOfferingsWithSelectionsUnexpanded)
        .then(translateOfferings);

    function loadNamesFromCycle(cycle) {
        return Q.all([
            vendorRepository.list()
                .then(function (vendors) {
                    vendors.forEach(function (vendor) { vendorNames[vendor.id] = vendor.name });
                }),
            libraryRepository.list()
                .then(function (libraries) {
                    libraries.forEach(function (library) { libraryNames[library.id] = library.name });
                }),
            productRepository.list(cycle)
                .then(function (products) {
                    products.forEach(function (product) { productNames[product.id] = product.name });
                }),
        ]).then(function () {
            return cycle;
        });
    }

    function translateOfferings(offerings) {
        return offerings.map(translateOffering);
    }

    function translateOffering(offering) {
        return {
            productId: offering.product,
            productName: productNames[offering.product],
            vendorId: offering.vendorId,
            vendorName: vendorNames[offering.vendorId],
            libraryId: offering.library,
            libraryName: libraryNames[offering.library],
            datePurchased: offering.selection.datePurchased,
            numberOfSeatsLicensed: offering.selection.users,
            amountPaidToVendor: offeringRepository.getFullSelectionPrice(offering),
            amountPaidByLibrary: offeringRepository.getFundedSelectionPrice(offering),
        };
    }
}

module.exports = {
    listLibraries: listLibraries,
    listLibraryUsers: listLibraryUsers,
    listCycles: listCycles,
    getSubscriptionData: getSubscriptionData
};
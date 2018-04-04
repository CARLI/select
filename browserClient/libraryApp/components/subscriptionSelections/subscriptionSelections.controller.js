angular.module('library.subscriptionSelections')
.controller('subscriptionSelectionsController', subscriptionSelectionsController);

function subscriptionSelectionsController( $q, $window, activityLogService, authService, csvExportService, cycleService, libraryStatusService, offeringService, productService, userService ){
    var vm = this;

    vm.selectionStep = '';
    vm.orderBy = 'product.name';
    vm.reverse = false;

    vm.offerings = [];
    vm.offeringsFromLastYear = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        funded: ['product.funded','product.name'],
        selectionPrice: [offeringService.getFundedSelectionPrice,'product.name']
    };

    vm.libraryId = null;
    vm.openProduct = {};
    vm.selectionProblems = [];
    vm.showProgress = false;
    vm.userIsReadOnly = userService.userIsReadOnly;

    vm.completeSelections = completeSelections;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.exportProductList = exportProductList;
    vm.getFundedSelectionPrice = getFundedSelectionPrice;
    vm.getFundedSiteLicensePrice = getFundedSiteLicensePrice;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.hasSelection = hasSelection;
    vm.isFunded = isFunded;
    vm.isSelected = isSelected;
    vm.returnToBeginning = returnToBeginning;
    vm.reviewSelections = reviewSelections;
    vm.selectAndUpdateProduct = selectAndUpdateProduct;
    vm.selectedLastYear = selectedLastYear;
    vm.selectLastYearsSelections = selectLastYearsSelections;
    vm.selectProduct = selectProduct;
    vm.sort = sort;
    vm.startSelections = startSelections;
    vm.toggleProduct = toggleProduct;
    vm.unSelectAndUpdateProduct = unSelectAndUpdateProduct;
    vm.unselected = unselected;
    vm.unSelectProduct = unSelectProduct;

    vm.noPrice = noPrice;
    vm.shouldDisplayPricing = shouldDisplayPricing;
    vm.shouldShowSiteLicensePrice = shouldShowSiteLicensePrice;
    vm.shouldShowSUPrices = shouldShowSUPrices;
    vm.shouldShowSpecificSuPrice = shouldShowSpecificSuPrice;

    activate();

    function activate(){
        vm.selectionStep = 'loading';
        vm.loadingPromise = loadLibraryStatus()
            .then(loadOfferingsForThisYear)
            .then(loadOfferingsForLastYear)
            .then(setSelectionScreenState);

        return vm.loadingPromise;
    }

    function loadLibraryStatus(){
        vm.library = userService.getUser().library;
        vm.libraryId = vm.library.id;
        return libraryStatusService.getStatusForLibrary(vm.libraryId, vm.cycle)
            .then(function(status){
                vm.libraryStatus = status;
            });
    }

    function loadOfferingsForCycle(cycle) {
        if ( cycle )
            return cycleService.listAllActiveOfferingsForCycle(cycle);
        return [];
    }

    function loadOfferingsForThisYear() {
        return loadOfferingsForCycle(vm.cycle)
            .then(function (offeringsList) {
                vm.offerings = offeringsList;
                return offeringsList;
            });
    }

    function loadOfferingsForLastYear() {
        return loadCycleForLastYear()
            .then(loadOfferingsForCycle)
            .then(function(offeringsList){
                vm.offeringsFromLastYear = offeringsList;
                return offeringsList;
            });

        function loadCycleForLastYear() {
            return cycleService.listPastFourCyclesMatchingCycle(vm.cycle)
                .then(function (lastFourCycles) {
                    return lastFourCycles[0];
                });
        }
    }

    function offeringForLastYear(offering) {
        var offeringId = offering.id;

        return vm.offeringsFromLastYear.filter(matchingOffering)[0];

        function matchingOffering(o) {
            return o.id === offeringId;
        }
    }

    function getLastYearsSelection(offering) {
        var lastYearsOffering = offeringForLastYear(offering);

        if (lastYearsOffering)
            return lastYearsOffering.selection;
        else
            return getSelectionFromOfferingHistory();

        function getSelectionFromOfferingHistory() {
            var lastYear = vm.cycle.year - 1;

            if (offering.history && offering.history[lastYear]) {
                return offering.history[lastYear].selection;
            }
            return null;
        }
    }

    function getLastYearsSelectionPrice(offering) {
        var lastYear = vm.cycle.year - 1;
        var lastYearsOffering = offeringForLastYear(offering);

        var lastYearsPricing = {};
        var lastYearsSelection = getLastYearsSelection(offering) || {};
        var lastYearsSelectionPrice = '';

        if (lastYearsOffering)
            lastYearsPricing = lastYearsOffering.pricing || {};
        else if (offering.history && offering.history[lastYear])
            lastYearsPricing = offering.history[lastYear].pricing;


        if (lastYearsPricing && lastYearsSelection.users) {
            var siteLicenseWasSelected = (lastYearsSelection.users == offeringService.siteLicenseSelectionUsers);

            if (siteLicenseWasSelected) {
                lastYearsSelectionPrice = lastYearsPricing.site;
            }
            else {
                lastYearsPricing.forEach(function (pricingObject) {
                    if (pricingObject.users == lastYearsSelection.users) {
                        lastYearsSelectionPrice = pricingObject.price;
                    }
                });
            }
        }

        return lastYearsSelectionPrice;
    }

    function selectedLastYear(offering) {
        return !!getLastYearsSelection(offering);
    }

    function setSelectionScreenState(){
        var cycleIsOpen = vm.cycle.isOpenToLibraries();
        var cycleIsClosed = vm.cycle.isClosed();
        var libraryIsComplete = (vm.libraryStatus && vm.libraryStatus.isComplete);
        var productsAreAvailable = vm.cycle.productsAreAvailable();

        if ( cycleIsOpen && !libraryIsComplete ){
            startSelections();
        }
        else if ( cycleIsOpen && libraryIsComplete ){
            selectionsComplete();
        }
        else if ( cycleIsClosed && !productsAreAvailable ){
            cycleRecentlyClosed();
        }
        else {
            cycleClosed();
        }
    }

    function selectProduct(offering, users) {
        offering.selection = {
            datePurchased: new Date().toJSON().slice(0, 10),
            users: users
        };

        return offering;
    }

    function fixOfferingHistory(offering) {
        console.log('checking for a fix to offering history', offering.id);

        var lastYear = vm.cycle.year - 1;
        var oldOffering = offeringForLastYear(offering);

        var currentOfferingIsMissingHistory = (!offering.history || !offering.history[lastYear] || !offering.history[lastYear].selection);
        var lastYearsSelection = getLastYearsSelection(offering) || {};
        var wasSelectedLastYear = lastYearsSelection.users;

        if ( currentOfferingIsMissingHistory && wasSelectedLastYear) {
            offeringService.updateHistory(oldOffering, offering, lastYear);
            console.log('fixed missing history for ', offering);
        }
    }

    function selectAndUpdateProduct(offering, users){
        selectProduct(offering, users);
        return updateOffering(offering)
            .then(logProductSelected);
    }

    function selectLastYearsSelections(){
        var changedOfferings = [];
        var selectionProblems = [];

        if ( $window.confirm('This will reset all of your selections to last year') ){
            vm.offerings.forEach(selectLastYear);

            activityLogService.logLibrarySelectedLastYearsSelections(vm.cycle, vm.library);

            showSelectionProblemsPopup(selectionProblems);

            return offeringService.bulkUpdateOfferings(changedOfferings, vm.cycle)
                .then(loadOfferingsForThisYear)
                .catch(function(err){ Logger.log('error', err, vm.offerings); });
        }

        function selectLastYear( offering ){
            if (!shouldDisplayPricing(offering))
                return;

            var lastYearsSelection = getLastYearsSelection(offering) || {};
            var wasSelectedLastYear = !!lastYearsSelection.users;

            if ( wasSelectedLastYear ){
                var users = lastYearsSelection.users;
                var selectionValidity = lastYearsSelectionIsStillValid(offering, users);

                if ( selectionValidity.isValid ){
                    selectProduct(offering, users);
                    fixOfferingHistory(offering);
                    changedOfferings.push(offering);
                }
                else {
                    selectionProblems.push({
                        product: offering.product.name,
                        reason: selectionValidity.reason
                    });
                }
            }
            else {
                if ( offering.selection ){
                    unSelectProduct(offering);
                    changedOfferings.push(offering);
                }
            }


            function lastYearsSelectionIsStillValid( offering, users ){
                var success = false;
                var reason = '';

                if ( users === 'Site License' ){
                    success = offering.pricing.site;
                    if ( !success ){
                        reason = 'No site license is offered this year.';
                    }
                }
                else {
                    success = offering.pricing.su.filter(matchingUsers).length;
                    if ( !success ){
                        reason = 'The previously chosen SU level (' + users + ') is no longer offered';
                    }
                }

                return {
                    isValid: !!success,
                    reason: reason
                };


                function matchingUsers(priceObject){
                    return priceObject.users === users;
                }
            }
        }
    }

    function isSelected(offering, users){
        if ( !offering.selection ){
            return false;
        }

        if ( users === offeringService.siteLicenseSelectionUsers ){
            return offering.selection.users === offeringService.siteLicenseSelectionUsers;
        }
        else {
            return offering.selection.users === users;
        }
    }

    function hasSelection( offering ){
        return offering.selection;
    }

    function unselected( offering ){
        return !hasSelection( offering );
    }

    function unSelectProduct(offering) {
        delete offering.selection;
        return offering;
    }

    function unSelectAndUpdateProduct(offering){
        delete offering.selection;
        return updateOffering(offering)
            .then(logProductRemoved);
    }

    function updateOffering( offering ){
        return offeringService.update(offering)
            .then(offeringService.load)
            .then(workaroundCouchSmell)
            .catch(function(err){
                console.error('Error updating offering', err);
            });

        function workaroundCouchSmell( updatedOffering ){
            offering._rev = updatedOffering._rev;
            return offering;
        }
    }

    function computeTotalPurchasesAmount() {
        var totalAmount = 0;

        vm.offerings.forEach(addSelectionAmount);

        return totalAmount;

        function addSelectionAmount( offering ){
            if ( offering.selection ){
                totalAmount += offeringService.getFundedSelectionPrice(offering);
            }
        }
    }

    function sort( newOrderBy ){
        if ( !newOrderBy ){
            return;
        }

        if ( vm.orderBy === newOrderBy ){
            vm.reverse = !vm.reverse;
        }
        else {
            vm.orderBy = newOrderBy;
            vm.reverse = false;
        }
    }

    function updateLibraryActivity() {
        if (!authService.userIsReadOnly())
            return libraryStatusService.markLibrarySelectionsIncomplete(vm.libraryId, vm.cycle);
        else
            return $q.when();
    }

    function startSelections() {
        return updateLibraryActivity()
            .finally(selectionsStarted);
    }

    function selectionsStarted(){
        vm.selectionStep = 'select';
        vm.showProgress = true;
    }

    function reviewSelections(){
        vm.selectionStep = 'review';
        vm.showProgress = true;
    }

    function completeSelections(){
        return libraryStatusService.markLibrarySelectionsComplete(vm.libraryId, vm.cycle)
            .then(selectionsComplete);
    }

    function selectionsComplete(){
        vm.selectionStep = 'complete';
        vm.showProgress = true;
    }

    function cycleRecentlyClosed(){
        vm.selectionStep = 'recentlyClosed';
        vm.showProgress = false;
    }

    function cycleClosed(){
        vm.selectionStep = 'closed';
        vm.showProgress = false;
    }

    function returnToBeginning(){
        $window.location.reload();
    }

    function showSelectionProblemsPopup( listOfProblems ){
        if ( !listOfProblems || !listOfProblems.length ){
            return;
        }
        else {
            vm.selectionProblems = listOfProblems;
            $('#selection-problems-modal').modal();
        }
    }

    function toggleProduct(product){
        vm.openProduct[product.id] = !vm.openProduct[product.id];
    }

    function logProductSelected(offering){
        return activityLogService.logLibrarySelectedProduct(offering, vm.cycle, vm.library.name);
    }

    function logProductRemoved(offering){
        return activityLogService.logLibraryRemovedProduct(offering, vm.cycle, vm.library.name);
    }

    function exportProductList() {
        var fileName = vm.cycle.name + ' Product List.csv';
        var exportHeaders = [
            'Product',
            'Last Year\'s Selected License',
            'Last Year\'s Selected Price',
            'Vendor',
            'CARLI Funded',
            'Selected License',
            'Selected Price'
        ];

        var exportData = vm.offerings.map(exportOffering);

        return csvExportService.exportToCsv(exportData, exportHeaders)
            .then(function (csvString) {
                return csvExportService.browserDownloadCsv(csvString, fileName);
            });

        function exportOffering(offering) {
            var lastYearsSelection = getLastYearsSelection(offering);
            return [
                vm.getProductDisplayName(offering.product),
                lastYearsSelection ? lastYearsSelection.users : '',
                lastYearsSelection ? getLastYearsSelectionPrice(offering) : '',
                offering.product.vendor.name,
                offeringService.isFunded(offering) ? 'true' : 'false',
                getSelectionUsers(offering),
                offeringService.getFundedSelectionPrice(offering)
            ];
        }

        function getSelectionUsers(offering) {
            var price = '';
            if (offering.selection) {
                price = offering.selection.users;
            }
            return price;
        }
    }

    function isFunded(offering) {
        return offeringService.isFunded(offering);
    }

    function getFundedSelectionPrice(offering) {
        return offeringService.getFundedSelectionPrice(offering);
    }

    function getFundedSiteLicensePrice(offering) {
        return offeringService.getFundedSiteLicensePrice(offering);
    }

    function showPrice(offering) {
        return offering.display === 'with-price'
    }

    function hasUpdatedSiteLicensePrice(offering) {
        return offering.pricing.site && offering.siteLicensePriceUpdated;
    }

    function hasUpdatedSuPricing(offering) {
        return offering.pricing.su && offering.pricing.su.length && offering.suPricesUpdated;
    }

    function noPrice(offering) {
        return !offering.pricing.site && !offering.pricing.su.length;
    }

    function shouldDisplayPricing(offering) {
        return showPrice(offering) && (hasUpdatedSiteLicensePrice(offering) || hasUpdatedSuPricing(offering));
    }

    function shouldShowSiteLicensePrice(offering) {
        return showPrice(offering) && hasUpdatedSiteLicensePrice(offering);
    }

    function shouldShowSUPrices(offering) {
        return showPrice(offering) && hasUpdatedSuPricing(offering);
    }

    function shouldShowSpecificSuPrice(offering, su) {
        if (offering.pricing.site) {
            return su.price < offering.pricing.site;
        }
        return true;
    }

}

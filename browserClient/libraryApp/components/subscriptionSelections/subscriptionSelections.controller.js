angular.module('library.subscriptionSelections')
.controller('subscriptionSelectionsController', subscriptionSelectionsController);

function subscriptionSelectionsController( $q, $window, activityLogService, csvExportService, cycleService, libraryStatusService, offeringService, productService, userService ){
    var vm = this;

    vm.selectionStep = '';
    vm.orderBy = 'product.name';
    vm.reverse = false;

    vm.offerings = [];
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
    vm.todo = todo;
    vm.toggleProduct = toggleProduct;
    vm.unSelectAndUpdateProduct = unSelectAndUpdateProduct;
    vm.unselected = unselected;
    vm.unSelectProduct = unSelectProduct;

    vm.noPrice = noPrice;
    vm.isPriceHidden = isPriceHidden;
    vm.isPriceShowing = isPriceShowing;
    vm.doesHaveSiteLicensePrice = doesHaveSiteLicensePrice;
    vm.doesHaveSUPrices = doesHaveSUPrices;

    activate();

    function activate(){
        vm.selectionStep = 'loading';
        return loadLibraryStatus()
            .then(loadOfferings)
            .then(setSelectionScreenState);
    }

    function loadLibraryStatus(){
        vm.library = userService.getUser().library;
        vm.libraryId = vm.library.id;
        return libraryStatusService.getStatusForLibrary(vm.libraryId, vm.cycle)
            .then(function(status){
                vm.libraryStatus = status;
            });
    }

    function loadOfferings() {
        vm.loadingPromise = cycleService.listAllActiveOfferingsForCycle(vm.cycle)
            .then(function(offeringsList){
                vm.offerings = offeringsList;
            });

        return vm.loadingPromise;
    }

    function selectedLastYear(offering){
        var lastYear = vm.cycle.year - 1;

        if ( offering.history && offering.history[lastYear] ){
            return offering.history[lastYear].selection;
        }
        return false;
    }

    function getLastYearsSelectionPrice(offering) {
        var lastYear = vm.cycle.year - 1;

        if (!offering.history || !offering.history[lastYear]) {
            return '';
        }

        var lastYearsPricing = offering.history[lastYear].pricing;
        var lastYearsSelection = selectedLastYear(offering);
        var lastYearsSelectionPrice = '';

        if (lastYearsPricing && lastYearsSelection) {
            var siteLicenseWasSelected = (lastYearsSelection.users == offeringService.siteLicenseSelectionUsers);

            if (siteLicenseWasSelected) {
                lastYearsSelectionPrice = lastYearsPricing.site;
            }
            else {
                lastYearsPricing.forEach(function (pricingObject) {
                    if (pricingObject.users == offering.history[lastYear].selection.users) {
                        lastYearsSelectionPrice = pricingObject.price;
                    }
                });
            }
        }

        return lastYearsSelectionPrice;
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

        function priceForUsers( numberOfUsers ){
            var pricingObj = offering.pricing.su.filter(matchingUsers)[0];
            return pricingObj.price;

            function matchingUsers(priceObject){
                return priceObject.users === numberOfUsers;
            }
        }
    }

    function selectAndUpdateProduct(offering, users){
        selectProduct(offering, users);
        return updateOffering(offering)
            .then(logProductSelected);
    }

    function selectLastYearsSelections(){
        var lastYear = vm.cycle.year - 1;
        var changedOfferings = [];
        var selectionProblems = [];

        if ( $window.confirm('This will reset all of your selections to last year') ){
            vm.offerings.forEach(selectLastYear);

            showSelectionProblemsPopup(selectionProblems);

            return offeringService.bulkUpdateOfferings(changedOfferings, vm.cycle)
                .then(function(){
                    return loadOfferings(vm.cycle);
                })
                .catch(function(err){ Logger.log('error', err, vm.offerings); });
        }

        function selectLastYear( offering ){
            var allHistory = offering.history || {};
            var history = allHistory[lastYear] || {};
            var wasSelectedLastYear = !!history.selection;

            if ( wasSelectedLastYear ){
                var users = history.selection.users;
                var selectionValidity = lastYearsSelectionIsStillValid(offering, users);

                if ( selectionValidity.isValid ){
                    selectProduct(offering, users);
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

    function startSelections() {
        return libraryStatusService.markLibrarySelectionsIncomplete(vm.libraryId, vm.cycle)
            .then(selectionsStarted);
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

    function todo(){
        alert("TODO");
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
        return activityLogService.logLibrarySelectedProduct(offering, vm.cycle);
    }

    function logProductRemoved(offering){
        return activityLogService.logLibraryRemovedProduct(offering, vm.cycle);
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
            var lastYearsSelection = selectedLastYear(offering);
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

    function noPrice(offering) {
        return !offering.pricing.site && !offering.pricing.su.length;
    }

    function isPriceHidden(offering) {
        return offering.display === 'without-price' || !offering.siteLicensePriceUpdated;
    }

    function isPriceShowing(offering) {
        return offering.display === 'with-price' && offering.siteLicensePriceUpdated;
    }

    function doesHaveSiteLicensePrice(offering) {
        return offering.pricing.site && offering.siteLicensePriceUpdated;
    }

    function doesHaveSUPrices(offering) {
        return offering.pricing.su && offering.pricing.su.length;
    }
}

angular.module('library.subscriptionSelections')
.controller('subscriptionSelectionsController', subscriptionSelectionsController);

function subscriptionSelectionsController( $q, $window, cycleService, libraryStatusService, offeringService, userService ){
    var vm = this;

    vm.selectionStep = '';
    vm.orderBy = 'product.name';
    vm.reverse = false;

    vm.offerings = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        funded: ['product.funded','product.name'],
        selectionPrice: ['selection.price', 'product.name']
    };

    vm.completeSelections = completeSelections;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.hasSelection = hasSelection;
    vm.isSelected = isSelected;
    vm.libraryId = null;
    vm.openProduct = {};
    vm.returnToBeginning = returnToBeginning;
    vm.reviewSelections = reviewSelections;
    vm.startSelections = startSelections;
    vm.selectLastYearsSelections = selectLastYearsSelections;
    vm.selectProduct = selectProduct;
    vm.selectAndUpdateProduct = selectAndUpdateProduct;
    vm.selectionProblems = [];
    vm.showProgress = false;
    vm.sort = sort;
    vm.todo = todo;
    vm.toggleProduct = toggleProduct;
    vm.unselected = unselected;
    vm.unSelectProduct = unSelectProduct;
    vm.unSelectAndUpdateProduct = unSelectAndUpdateProduct;

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
        vm.loadingPromise = cycleService.listAllOfferingsForCycle(vm.cycle)
            .then(function(offeringsList){
                vm.offerings = offeringsList;
            });

        return vm.loadingPromise;
    }

    function setSelectionScreenState(){
        console.log('library status', vm.libraryStatus);

        var cycleIsOpen = vm.cycle.isOpenToLibraries();
        var cycleIsClosed = vm.cycle.isClosed();
        var libraryIsComplete = (vm.libraryStatus && vm.libraryStatus.isComplete);
        var productsAreAvailable = vm.cycle.productsAreAvailable();

        if ( cycleIsOpen && !libraryIsComplete ){
            console.log('cycle is open, library not complete');
            startSelections();
        }
        else if ( cycleIsOpen && libraryIsComplete ){
            console.log('cycle is open, library complete');
            selectionsComplete();
        }
        else if ( cycleIsClosed && !productsAreAvailable ){
            console.log('cycle is closed, products not yet available');
            cycleRecentlyClosed();
        }
        else {
            console.log('cycle is closed, products are available');
            cycleClosed();
        }
    }

    function selectProduct(offering, users) {
        offering.selection = {
            datePurchased: new Date().toJSON().slice(0, 10),
            users: users
        };

        if ( users === 'Site License' ){
            offering.selection.price = offering.pricing.site;
        }
        else {
            offering.selection.price = priceForUsers(users);
        }

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
        return updateOffering(offering);
    }

    function selectLastYearsSelections(){
        var lastYear = vm.cycle.year - 1;
        var changedOfferings = [];
        var selectionProblems = [];

        if ( $window.confirm('This will reset all of your selections to last year') ){
            vm.offerings.forEach(selectLastYear);

            sort(vm.sortOptions.selectionPrice);
            showSelectionProblemsPopup(selectionProblems);

            return offeringService.bulkUpdateOfferings(changedOfferings, vm.cycle)
                .then(function(){
                    return loadOfferings(vm.cycle);
                })
                .catch(function(err){ console.log('error', err, vm.offerings); });
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

        if ( users === 'Site License' ){
            return offering.selection.users === 'Site License';
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
        return updateOffering(offering);
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
                totalAmount += offering.selection.price;
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


    function startSelections(){
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
}
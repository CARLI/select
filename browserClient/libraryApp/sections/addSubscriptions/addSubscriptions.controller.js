angular.module('library.sections.addSubscriptions')
.controller('addSubscriptionsController', addSubscriptionsController);

function addSubscriptionsController( $q, $routeParams, $window, cycleService, offeringService, productService, userService ){
    var vm = this;

    vm.cycle = null;
    vm.selectionStep = 'select';
    vm.libraryId = userService.getUser().library.id;
    vm.orderBy = 'product.name';
    vm.reverse = false;

    vm.offerings = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        funded: ['product.funded','product.name'],
        pricing: ['pricing.site','product.name'],
        selectionPrice: ['selection.price', 'product.name']
    };

    vm.completeSelections = completeSelections;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.hasSelection = hasSelection;
    vm.isSelected = isSelected;
    vm.returnToBeginning = returnToBeginning;
    vm.reviewSelections = reviewSelections;
    vm.startSelections = startSelections;
    vm.selectLastYearsSelections = selectLastYearsSelections;
    vm.selectProduct = selectProduct;
    vm.selectAndUpdateProduct = selectAndUpdateProduct;
    vm.sort = sort;
    vm.todo = todo;
    vm.unSelectProduct = unSelectProduct;
    vm.unSelectAndUpdateProduct = unSelectAndUpdateProduct;

    activate();

    function activate(){
        vm.loadingPromise = getCycleForRouteParameter()
            .then(loadOfferings);
    }

    function getCycleForRouteParameter(){
        var cycleId = $routeParams.cycleId;
        return cycleService.load(cycleId);
    }

    function loadOfferings( cycle ) {
        vm.cycle = cycle;
        return cycleService.listAllOfferingsForCycle(cycle)
            .then(function(offeringsList){
                vm.offerings = offeringsList;
            });
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

        if ( $window.confirm('This will reset all of your selections to last year') ){
            vm.offerings.forEach(selectLastYear);
        }


        /*
        {
            "2013": {
                "pricing": {
                    "site": 1000,
                    "su": []
                },
                "selection": {
                    "users": "Site License",
                     "price": 1000
                }
            }
        }
         */
        function selectLastYear( offering ){
            var allHistory = offering.history || {};
            var history = allHistory[lastYear] || {};

            if ( history.selection ){
                console.log('Last year '+offering.product.name+' was selected ',history.selection);

                var users = history.selection.users;
                var selectionValidity = lastYearsSelectionIsStillValid(offering, users);

                if ( selectionValidity.isValid ){
                    console.log('  offering is still valid, select it again');
                    selectProduct(offering, users);
                }
                else {
                    console.log('  selection not valid because '+selectionValidity.reason);
                }
            }
            else {
                console.log('No selection last year for '+offering.product.name+' - deselecting');
                unSelectProduct(offering);
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
            .then(workaroundCouchSmell);

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
    }

    function reviewSelections(){
        vm.selectionStep = 'review';
    }

    function completeSelections(){
        vm.selectionStep = 'complete';
    }

    function returnToBeginning(){
        $window.location.reload();
    }

    function todo(){
        alert("TODO");
    }
}

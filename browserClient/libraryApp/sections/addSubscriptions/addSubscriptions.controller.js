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
        pricing: ['pricing.site','product.name']
    };

    vm.completeSelections = completeSelections;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.hasSelection = hasSelection;
    vm.isSelected = isSelected;
    vm.returnToBeginning = returnToBeginning;
    vm.reviewSelections = reviewSelections;
    vm.startSelections = startSelections;
    vm.selectProduct = selectProduct;
    vm.sort = sort;
    vm.todo = todo;
    vm.unselectProduct = unselectProduct;

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

        return updateOffering(offering);


        function priceForUsers( numberOfUsers ){
            var pricingObj = offering.pricing.su.filter(matchingUsers)[0];
            return pricingObj.price;

            function matchingUsers(priceObject){
                return priceObject.users === numberOfUsers;
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

    function unselectProduct(offering) {
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

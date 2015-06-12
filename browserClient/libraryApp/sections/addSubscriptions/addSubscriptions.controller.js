angular.module('library.sections.addSubscriptions')
.controller('addSubscriptionsController', addSubscriptionsController);

function addSubscriptionsController( $q, $routeParams, $window, cycleService, offeringService, productService, userService ){
    var vm = this;

    vm.cycle = null;
    vm.selectionStep = 'select';
    vm.libraryId = userService.getUser().library.id;
    vm.orderByAvailable = 'product.name';
    vm.orderByPurchased = 'product.name';
    vm.reverseAvailable = false;
    vm.reversePurchased = false;

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
        cycleService.setCurrentCycle(cycle);

        return offeringService.listOfferingsForLibraryId(vm.libraryId)
            .then(populateProductsForOfferings)
            .then(function (offeringList) {
                vm.offerings = offeringList;
                return offeringList;
            });

        function populateProductsForOfferings( offeringsList ){
            return $q.all(offeringsList.map(loadProduct));

            function loadProduct(offering){
                if (typeof offering.product.vendor == 'object' && offering.product.license == 'object') {
                    return $q.when(offering);
                } else {
                    return productService.load(offering.product.id)
                        .then(function(product){
                            offering.product = product;
                            return offering;
                        });
                }
            }
        }
    }

    function selectProduct(offering, users) {
        if ( offering.selection ){
            return $q.when();
        }

        offering.selection = {
            datePurchased: new Date().toJSON().slice(0, 10),
            users: users
        };

        //TODO: set price of selection
//        if ( users === 'site' ){
//            offering.selection.price = offering.pricing.site
//        }

        return updateOffering(offering);
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

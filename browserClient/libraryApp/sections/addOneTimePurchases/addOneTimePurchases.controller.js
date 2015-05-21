angular.module('library.sections.addOneTimePurchases')
.controller('addOneTimePurchasesController', addOneTimePurchasesController);

function addOneTimePurchasesController( $q, $window, config, cycleService, offeringService, productService, userService ){
    var vm = this;

    vm.selectionStep = 'select';
    vm.libraryId = userService.getUser().library.id;
    vm.orderByAvailable = 'product.name';
    vm.orderByPurchased = 'product.name';
    vm.reverseAvailable = false;
    vm.reversePurchased = false;

    vm.availableForPurchase = [];
    vm.purchased = [];
    vm.sortOptions = {
        productName: 'product.name',
        vendorName: ['product.vendor.name','product.name'],
        funded: ['product.funded','product.name'],
        pricing: ['pricing.site','product.name']
    };

    vm.completeSelections = completeSelections;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.hasPendingSelection = hasPendingSelection;
    vm.returnToBeginning = returnToBeginning;
    vm.reviewSelections = reviewSelections;
    vm.startSelections = startSelections;
    vm.selectProduct = selectProduct;
    vm.sortAvailable = function sortAvailable(newSort){ sort(newSort, 'Available'); };
    vm.sortPurchased = function sortPurchased(newSort){ sort(newSort, 'Purchased'); };
    vm.unselectProduct = unselectProduct;

    activate();

    function activate(){
        vm.loadingPromise = setCycleToOneTimePurchase()
            .then(loadOfferings);
    }

    function setCycleToOneTimePurchase(){
        return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function(oneTimePurchaseCycle){
            cycleService.setCurrentCycle(oneTimePurchaseCycle);
            return oneTimePurchaseCycle;
        });
    }

    function loadOfferings( ) {
        return offeringService.listOfferingsForLibraryId(vm.libraryId)
            .then(populateProductsForOfferings)
            .then(function (offeringList) {
                vm.availableForPurchase = offeringList.filter(availableForPurchase);
                vm.purchased = offeringList.filter(purchased);
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

        function availableForPurchase( offering ){
            return !offering.selection;
        }

        function purchased( offering ){
            return offering.selection;
        }
    }

    function hasPendingSelection( offering ){
        return offering.selectionPendingReview;
    }

    function selectProduct(offering) {
        offering.selectionPendingReview = {
            price: offering.pricing.site,
            datePurchased: new Date().toJSON().slice(0, 10)
        };
    }

    function unselectProduct(offering) {
        delete offering.selectionPendingReview;
    }

    function computeTotalPurchasesAmount() {
        var totalAmount = 0;

        vm.availableForPurchase.forEach(addPendingSelectionAmount);

        return totalAmount;

        function addPendingSelectionAmount( offering ){
            if ( offering.selectionPendingReview ){
                totalAmount += offering.selectionPendingReview.price;
            }
        }
    }

    function sort( newOrderBy, sortProperty ){
        if ( !newOrderBy ){
            return;
        }

        if ( vm['orderBy'+sortProperty] === newOrderBy ){
            vm['reverse'+sortProperty] = !vm['reverse'+sortProperty];
        }
        else {
            vm['orderBy'+sortProperty] = newOrderBy;
            vm['reverse'+sortProperty] = false;
        }
    }


    function startSelections(){
        vm.selectionStep = 'select';
    }

    function reviewSelections(){
        vm.selectionStep = 'review';
    }

    function completeSelections(){
        return $q.all(vm.availableForPurchase.map(selectOfferingAndSave))
            .then(function(){
                vm.selectionStep = 'complete';
            });

        function selectOfferingAndSave( offering ){
            offering.selection = offering.selectionPendingReview;
            delete offering.selectionPendingReview;

            return offeringService.update(offering);
        }
    }

    function returnToBeginning(){
        $window.location.reload();
    }
}

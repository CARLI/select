angular.module('library.sections.addOneTimePurchases')
.controller('addOneTimePurchasesController', addOneTimePurchasesController);

function addOneTimePurchasesController( $q, $window, config, activityLogService, cycleService, offeringService, productService, userService ){
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
        vendorName: ['product.vendor.name', 'product.name'],
        funded: ['product.funded', 'product.name'],
        pricing: ['pricing.site', 'product.name'],
        selectionPrice: ['selection.price', 'product.name']
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
    vm.todo = todo;
    vm.unSelectProduct = unselectProduct;

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

    function loadOfferings(cycle) {
        return cycleService.listAllOfferingsForCycle(cycle)
            .then(function(offeringList){
                vm.availableForPurchase = offeringList.filter(availableForPurchase);
                vm.purchased = offeringList.filter(purchased);
            });

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
        if ( offering.selectionPendingReview ){
            return $q.when();
        }

        offering.selectionPendingReview = {
            datePurchased: new Date().toJSON().slice(0, 10),
            price: offering.pricing.site,
            users: 'site'
        };

        return updatePendingSelection(offering);
    }

    function unselectProduct(offering) {
        delete offering.selectionPendingReview;
        return updatePendingSelection(offering);
    }

    function updatePendingSelection( offering ){
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
            if ( offering.selectionPendingReview ){
                offering.selection = offering.selectionPendingReview;
                offering.selection.datePurchased = new Date().toJSON().slice(0, 10);
                delete offering.selectionPendingReview;

                return offeringService.update(offering)
                    .then(function(){
                        return activityLogService.logOtpPurchase(offering);
                    });
            }
            else {
                return $q.when();
            }
        }
    }

    function returnToBeginning(){
        $window.location.reload();
    }

    function todo(){
        alert("TODO");
    }
}

angular.module('library.sections.addOneTimePurchases')
.controller('addOneTimePurchasesController', addOneTimePurchasesController);

function addOneTimePurchasesController( $q, $location, config, activityLogService, csvExportService, cycleService, emailService, offeringService, productService, userService ){
    var vm = this;

    vm.agreedToTerms = false;
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
        selectionPrice: [offeringService.getFundedSelectionPrice,'product.name']
    };

    vm.agreedToTermsChanged = agreedToTermsChanged;
    vm.completeSelections = completeSelections;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.exportProductList = exportProductList;
    vm.getFundedSelectionPrice = getFundedSelectionPrice;
    vm.getFundedSelectionPendingPrice = getFundedSelectionPendingPrice;
    vm.getFundedSiteLicensePrice = getFundedSiteLicensePrice;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.hasPendingSelection = hasPendingSelection;
    vm.isFunded = isFunded;
    vm.returnToBeginning = returnToBeginning;
    vm.reviewSelections = reviewSelections;
    vm.selectProduct = selectProduct;
    vm.sortAvailable = function sortAvailable(newSort){ sort(newSort, 'Available'); };
    vm.sortPurchased = function sortPurchased(newSort){ sort(newSort, 'Purchased'); };
    vm.startSelections = startSelections;
    vm.todo = todo;
    vm.unSelectProduct = unselectProduct;
    vm.wasFullyFunded = wasFullyFunded;
    vm.userIsReadOnly = userService.userIsReadOnly;

    activate();

    function activate(){
        vm.loadingPromise = setCycleToOneTimePurchase()
            .then(loadOfferings);
    }

    function setCycleToOneTimePurchase(){
        return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function(oneTimePurchaseCycle){
            cycleService.setCurrentCycle(oneTimePurchaseCycle);
            vm.cycle = oneTimePurchaseCycle;
            return oneTimePurchaseCycle;
        });
    }

    function loadOfferings(cycle) {
        return cycleService.listAllActiveOfferingsForCycle(cycle)
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
            users: offeringService.siteLicenseSelectionUsers
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
        $('#terms-and-conditions-modal').modal('hide');
        vm.selectionStep = 'review';
    }

    function agreedToTermsChanged(){
        vm.agreedToTerms = !vm.agreedToTerms;
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
                        return activityLogService.logOtpPurchase(offering, 'library');
                    })
                    .then(function(){
                        return emailService.sendOneTimePurchaseMessage(offering.id);
                    });
            }
            else {
                return $q.when();
            }
        }
    }

    function returnToBeginning(){
        startSelections();
        activate();
    }

    function todo(){
        alert("TODO");
    }

    function exportProductList(offerings) {
        var fileName = 'One-time Purchase Product List.csv';
        var exportHeaders = [
            'Product',
            'Vendor',
            'CARLI Funded',
            'Selected License',
            'Selected Price'
        ];

        var exportData = offerings.map(exportOffering);

        return csvExportService.exportToCsv(exportData, exportHeaders)
            .then(function (csvString) {
                return csvExportService.browserDownloadCsv(csvString, fileName);
            });

        function exportOffering(offering) {
            return [
                vm.getProductDisplayName(offering.product),
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
    function getFundedSelectionPendingPrice(offering) {
        return offeringService.getFundedSelectionPendingPrice(offering);
    }
    function getFundedSiteLicensePrice(offering) {
        return offeringService.getFundedSiteLicensePrice(offering);
    }
    function wasFullyFunded(offering) {
        var pricePaid = getFundedSelectionPrice(offering);
        return pricePaid === 0 || pricePaid === 0.01;
    }
}

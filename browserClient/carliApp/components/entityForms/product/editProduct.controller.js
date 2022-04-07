angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $q, $scope, $rootScope, $filter, activityLogService, alertService, entityBaseService, errorHandler, cycleService, libraryService, licenseService, offeringService, productService, vendorService) {
    var vm = this;

    var offeringsCopy = [];
    var termFieldsCopy = {};
    var priceCapsCopy = {};
    var originalProductName = null;

    var templates = {
        productFields: 'carliApp/components/entityForms/product/editProduct.html',
        oneTimePurchaseFields: 'carliApp/components/entityForms/product/editOneTimePurchase.html'
    };
    vm.currentTemplate = templates.productFields;

    var afterSubmitCallback = vm.afterSubmitFn || function() {};

    vm.bulkFundedByPercentage = true;
    vm.bulkFundedPercent = 100;
    vm.bulkFundedPrice = 0;
    vm.fundingSummaries = [];
    vm.hideOffering = {};
    vm.productOfferings = [];

    vm.addPriceCapRow = addPriceCapRow;
    vm.applyBulkFunding = applyBulkFunding;
    vm.cancelEdit = cancelEdit;
    vm.cancelFundingEdit = revertOfferings;
    vm.cancelOtpEdit = revertOfferings;
    vm.cancelPriceCapEdits = cancelPriceCapEdits;
    vm.cancelTermsEdit = revertTermFields;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.productLicenseIsValid = productLicenseIsValid;
    vm.rememberFundingFields = rememberOfferings;
    vm.rememberOtpFields = rememberOfferings;
    vm.rememberPriceCaps = rememberPriceCaps;
    vm.rememberTermFields = rememberTermFields;
    vm.removeBulkFunding = removeBulkFunding;
    vm.removeFunding = removeFunding;
    vm.saveProduct = saveProduct;
    vm.shouldShowFundingLink = shouldShowFundingLink;
    vm.shouldShowManagePriceCapLink = shouldShowManagePriceCapLink;
    vm.shouldShowOtpEditLink = shouldShowOtpEditLink;
    vm.shouldShowTermsEditLink = shouldShowTermsEditLink;
    vm.submitAction = submitAction;
    vm.submitLabel = submitLabel;
    vm.toggleEditable = toggleEditable;

    vendorService.list().then( function( vendorList ){
       vm.vendorList = vendorList;
    });

    refreshLicenseList();
    $scope.$watch('vm.product.vendor', refreshLicenseList);

    vm.statusOptions = entityBaseService.getStatusOptions();

    vm.productDetailCodeOptions = productService.getProductDetailCodeOptions();

    setupModalClosingUnsavedChangesWarning();
    activate();

    function activate() {
        vm.isModal = vm.newProduct;

        if ( isNewProduct() ) {
            vm.loadingPromise = initializeForNewProduct();
        }
        else {
            vm.loadingPromise = initializeForExistingProduct();
        }

        function isNewProduct(){
            return !vm.product.id;
        }
    }

    function initializeForNewProduct() {
        //Logger.log(' edit new product');
        initSubFormData();
        vm.editable = true;
        vm.hideOffering = {};
        vm.newProduct = true;
        vm.productOfferings = [];

        setProductFormPristine();

        return ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries();
    }

    function initializeForExistingProduct() {
        //Logger.log(' edit '+vm.product.name, vm.product);
        initSubFormData();
        vm.editable = false;
        vm.newProduct = false;

        vm.year = vm.product.cycle.year;

        setProductFormPristine();

        initializeProductNameWatcher();
        rememberOfferings();
        rememberTermFields();
        rememberPriceCaps();

        cycleService.setCurrentCycle(vm.product.cycle);

        if ( isOneTimePurchaseProduct(vm.product) ){
            return loadOfferingsForProduct(vm.product)
                .then(updateFundingSummary)
                .then(initializeHideOfferingsCheckboxModels)
                .then(ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries);
        }
        else {
            return loadOfferingsForProduct(vm.product)
                .then(updateFundingSummary);
        }
    }

    function initSubFormData() {
        fundingCopy = {};
        offeringsCopy = [];
        termFieldsCopy = {};
        priceCapsCopy = [];
        originalProductName = null;
    }

    function initializeProductNameWatcher() {
        originalProductName = vm.product.name;
        if (vm.product.previousName) {
            vm.shouldShowPreviousNameOption = true;
        }
        $scope.$watch('vm.product.name', function (newName, oldName) {
            if (oldName && oldName != newName) {
                vm.shouldShowPreviousNameOption = true;
            }
        });
    }

    function revertOfferings() {
        angular.copy(offeringsCopy, vm.productOfferings);
    }

    function rememberOfferings() {
        angular.copy(vm.productOfferings, offeringsCopy);
        updateFundingSummary();
    }

    function revertTermFields() {
        vm.product.terms = angular.copy(termFieldsCopy, {});
    }

    function rememberTermFields() {
        angular.copy(vm.product.terms, termFieldsCopy);
    }

    function cancelPriceCapEdits(){
        vm.product.futurePriceCaps = angular.copy(priceCapsCopy, []);
    }

    function rememberPriceCaps(){
        angular.copy(vm.product.futurePriceCaps, priceCapsCopy);
    }

    function isOneTimePurchaseProduct(product) {
        var cycle = product.cycle || {};
        return cycle.cycleType === 'One-Time Purchase';
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        if ( vm.isModal ){
            return;
        }
        else {
            resetProductForm();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#new-product-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetProductForm() {
        if ( vm.newProduct ) {
            return $q.when(initializeForNewProduct());
        }
        else {
            var expandedCycle = vm.product.cycle;
            return productService.load(vm.product.id)
                .then(function (freshCopyOfProduct){
                    freshCopyOfProduct.cycle = expandedCycle;
                    vm.product = freshCopyOfProduct;
                    return freshCopyOfProduct;
                })
                .then(initializeForExistingProduct);
        }
    }

    function hideProductModal() {
        $('#new-product-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( productFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetProductForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function productFormIsDirty(){
        if ($scope.productForm) {
            return $scope.productForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.productForm) {
            return $rootScope.forms.productForm.$dirty;
        }
        return false;
    }

    function setProductFormPristine() {
        vm.currentTemplate = templates.productFields;
        
        if ($scope.productForm) {
            $scope.productForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.productForm) {
            $rootScope.forms.productForm.$setPristine();
        }

        if ($scope.oneTimePurchasePricingForm) {
            $scope.oneTimePurchasePricingForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.oneTimePurchasePricingForm) {
            $rootScope.forms.oneTimePurchasePricingForm.$setPristine();
        }
    }


    function loadOfferingsForProduct( product ){
        return offeringService.listOfferingsForProductId(product.id).then(function(offerings){
            vm.productOfferings = offerings;
            return offerings;
        });
    }

    function isWizardComplete() {
        if ( !isOneTimePurchaseProduct(vm.product)) {
            return true;
        }
        if (vm.currentTemplate == templates.oneTimePurchaseFields) {
            return true;
        }
        return false;
    }

    function submitAction() {
        if (!vm.newProduct || isWizardComplete()) {
            return saveProduct();
        } else {
            return ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries().then(function(){
                vm.currentTemplate = templates.oneTimePurchaseFields;
            });
        }
    }

    function submitLabel() {
        if (!vm.newProduct || isWizardComplete()) {
            return 'Save';
        }
        return 'Next';
    }

    function saveProduct(){
        translateOptionalSelections();
        fixOtpDateFormat();

        var savePromise = $q.when();

        if (vm.newProduct) {
            savePromise = saveNewProduct();
        } else {
            savePreviousName();
            savePromise = saveExistingProduct();
        }

        return savePromise.then(syncData);

        function syncData(){
            return cycleService.syncDataToVendorDatabase( vm.product.vendor.id, vm.product.cycle );
        }
    }

    function translateOptionalSelections() {
        if (vm.product.license === undefined) {
            vm.product.license = null;
        }
    }

    function fixOtpDateFormat(){
        if ( isOneTimePurchaseProduct(vm.product) && typeof vm.product.oneTimePurchaseAvailableForPurchaseThrough === 'object' ){
            vm.product.oneTimePurchaseAvailableForPurchaseThrough = vm.product.oneTimePurchaseAvailableForPurchaseThrough.toISOString();
        }
    }

    function savePreviousName() {
        if (originalProductName !== vm.product.name) {
            vm.product.previousName = originalProductName;
        }
    }

    function saveExistingProduct() {
        return productService.update(vm.product)
            .then(updateOfferingsForExistingProduct)
            .then(function () {
                alertService.putAlert('Product updated', {severity: 'success'});
                resetProductForm().then(function(){
                    hideProductModal();
                    afterSubmitCallback();
                    return logUpdateActivity();
                });
            })
            .catch(errorHandler);
    }

    function saveNewProduct() {
        return productService.create(vm.product)
            .then(function(newProductId){
                vm.product.id = newProductId;
                logAddActivity();
                return newProductId;
            })
            .then(saveOfferingsForNewProduct)
            .then(function (offeringsIds) {
                alertService.putAlert('Product added', {severity: 'success'});

                return resetProductForm().then(function(){
                    hideProductModal();
                    afterSubmitCallback();
                });
            })
            .catch(errorHandler);
    }

    function updateOfferingsForExistingProduct(){
        setOfferingDisplayBasedOnHideColumnFromOneTimePurchaseForm();

        var savePromises = [];

        if ( vm.productOfferings ){
            vm.productOfferings.forEach(function(offering){
                if ( offering.id ){
                    savePromises.push( offeringService.update(offering) );
                }
                else {
                    offering.library = offering.library.id.toString();
                    savePromises.push( offeringService.create(offering) );
                }
            });
        }

        return $q.all( savePromises );
    }

    function saveOfferingsForNewProduct( productId ){
        setOfferingDisplayBasedOnHideColumnFromOneTimePurchaseForm();

        var savePromises = [];

        if ( vm.productOfferings.length ){
            vm.productOfferings.forEach(function(partialOffering){
                savePromises.push( createNewOffering(partialOffering) );
            });
        }
        else {
            savePromises = [offeringService.ensureProductHasOfferingsForAllLibraries( vm.product )];
        }

        return $q.all( savePromises );

        function createNewOffering( partialOffering ){
            var newOffering = angular.copy(partialOffering);
            newOffering.product = productId;
            newOffering.library = partialOffering.library.id.toString();
            delete newOffering.$$hashKey;

            return offeringService.create(newOffering);
        }
    }

    function ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries(){
        if ( isOneTimePurchaseProduct(vm.product) ){
            return libraryService.listActiveLibraries().then(ensureProductHasOfferingForEachLibrary);
        }
        else {
            return $q.when();
        }

        function ensureProductHasOfferingForEachLibrary( libraryList ){
            return libraryList.map(ensureProductHasOfferingForLibrary);
        }

        function ensureProductHasOfferingForLibrary( library ){
            if ( productDoesNotHaveOfferingForLibrary(library) ){
                vm.productOfferings.push( createEmptyOffering(library) );
            }

            function productDoesNotHaveOfferingForLibrary(library){
                return vm.productOfferings.filter(function(offering){
                    return offering.library.id == library.id;
                }).length === 0;
            }
        }

        function createEmptyOffering( library ){
            var newOffering = {
                type: 'Offering',
                cycle: vm.product.cycle,
                display: 'none',
                library: library,
                pricing: {}
            };

            if ( vm.product.id ){
                newOffering.product = vm.product;
            }

            return newOffering;
        }
    }

    function setOfferingDisplayBasedOnHideColumnFromOneTimePurchaseForm(){
        if ( isOneTimePurchaseProduct(vm.product) ){
            vm.productOfferings.forEach(function(offering){
                if (vm.hideOffering[offering.id]){
                    offering.display = 'none';
                }
            });
        }
    }

    function filterLicensesBelongingToVendor(vendor) {
        return function(license) {
            return vendor.id === license.vendor.id;
        };
    }

    function refreshLicenseList() {
        if (vm.product && vm.product.vendor) {
            licenseService.list().then(function (licenseList) {
                vm.licenseList = $filter('filter')(licenseList, filterLicensesBelongingToVendor(vm.product.vendor));
                vm.noLicensesMessage = vm.licenseList.length > 0 ? '' : 'No license agreements for vendor';
            });
        } else {
            vm.noLicensesMessage = 'Please select a vendor first';
        }
    }

    function productLicenseIsValid(){
        return vm.product && vm.product.license && typeof vm.product.license === 'object';
    }

    function shouldShowFundingLink() {
        return vm.editable && !vm.newProduct;
    }

    function shouldShowOtpEditLink() {
        return vm.editable && !vm.newProduct && isOneTimePurchaseProduct(vm.product);
    }

    function shouldShowTermsEditLink() {
        return vm.editable && !vm.newProduct;
    }

    function shouldShowManagePriceCapLink() {
        return vm.editable && !vm.newProduct;
    }

    function addPriceCapRow(){
        vm.product.futurePriceCaps = vm.product.futurePriceCaps || {};
        var priceCaps = vm.product.futurePriceCaps;
        var nextYear = findMaxPriceCapYear(priceCaps) + 1;
        priceCaps[nextYear] = 0;

        function findMaxPriceCapYear(priceCapsObject){
            return  1 * (Object.keys(priceCapsObject).sort().reverse()[0] || vm.year);
        }
    }

    function logUpdateActivity(){
        return activityLogService.logEntityModified(vm.product);
    }

    function logAddActivity(){
        return activityLogService.logEntityAdded(vm.product);
    }

    function initializeHideOfferingsCheckboxModels(offerings){
        vm.hideOffering = {};
        offerings.forEach(function(offering){
            if ( offering.id ) {
                vm.hideOffering[offering.id] = (offering.display === "none");
            }
        });
    }

    function applyBulkFunding() {
        vm.productOfferings.forEach(function (offering) {
            offering.funding = offering.funding || {};
            offering.funding.fundedByPercentage = vm.bulkFundedByPercentage;
            offering.funding.fundedPercent = vm.bulkFundedPercent;
            offering.funding.fundedPrice = vm.bulkFundedPrice;
        });
    }

    function removeBulkFunding() {
        vm.bulkFundedByPercentage = true;
        vm.bulkFundedPercent = 0;
        applyBulkFunding();
    }

    function removeFunding(offering) {
        offering.funding = offering.funding || {};
        offering.funding.fundedByPercentage = true;
        offering.funding.fundedPercent = 0;
    }

    function updateFundingSummary(promise) {
        var fullyFundedCount = 0;
        var partiallyFundedCount = 0;
        var offeringCount = vm.productOfferings.length;

        if (offeringCount === 0) {
            vm.fundingSummaries = [];
            return promise;
        }

        vm.productOfferings.forEach(tallyFunding);
        updateSummaryBasedOnTally();

        return promise;

        function tallyFunding(offering) {
            if (offering.funding) {
                if (offering.funding.fundedByPercentage) {
                    tallyFundingByPercent();
                } else {
                    tallyFundingByPrice();
                }
            }

            function tallyFundingByPercent() {
                if (offering.funding.fundedPercent == 100) {
                    fullyFundedCount++;
                } else if (offering.funding.fundedPercent > 0) {
                    partiallyFundedCount++;
                }
            }
            function tallyFundingByPrice() {
                if (offering.funding.fundedPrice > 0) {
                    partiallyFundedCount++;
                }
            }
        }

        function updateSummaryBasedOnTally() {
            if (productIsNotFunded()) {
                summarizeNoFunding();
            } else if (productIsFullyFundedForAll()) {
                summarizeFullFundingForAll();
            } else if (productIsPartiallyFundedForAll()) {
                summarizePartialFundingForAll();
            } else {
                summarizeMixedFunding();
            }

            function productIsNotFunded() {
                return fullyFundedCount === 0 && partiallyFundedCount === 0;
            }
            function productIsFullyFundedForAll() {
                return fullyFundedCount === offeringCount;
            }
            function productIsPartiallyFundedForAll() {
                return partiallyFundedCount === offeringCount;
            }

            function summarizeNoFunding() {
                vm.fundingSummaries = [ 'Not funded.' ];
            }
            function summarizeFullFundingForAll() {
                vm.fundingSummaries = [ 'Fully funded for all libraries.' ];
            }
            function summarizePartialFundingForAll() {
                vm.fundingSummaries = [ 'Partially funded for all libraries.' ];
            }
            function summarizeMixedFunding() {
                vm.fundingSummaries = [];
                if (fullyFundedCount > 0) {
                    vm.fundingSummaries.push('Fully funded for some libraries.');
                }
                if (partiallyFundedCount > 0) {
                    vm.fundingSummaries.push('Partially funded for some libraries.');
                }
            }
        }
    }
}

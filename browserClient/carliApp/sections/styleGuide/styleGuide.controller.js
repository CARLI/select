angular.module('carli.sections.styleGuide')
    .controller('styleGuideController', styleGuideController);

function styleGuideController(componentExamples, componentGatherer, alertService) {
    var vm = this;
    var basePath = '/carliApp/sections/styleGuide/examples/';

    vm.components = componentGatherer.gather(componentExamples, basePath);

    initAlertsExample(vm, alertService);
    initFilterByActiveExample(vm);
    initViewEditCheckboxExample(vm);
    initViewEditContactExample(vm);
    initViewEditNumberExample(vm);
    initViewEditTextAreaExample(vm);
    initViewEditTextFieldExample(vm);
    initViewEditYesNoOtherExample(vm);
    initViewEditDate(vm);
}

function initAlertsExample(vm, alertService) {
    vm.showGoodAlert = function (message) {
        alertService.putAlert(message, {severity: 'success'});
    };
    vm.showBadAlert = function (message) {
        alertService.putAlert(message, {severity: 'danger'});
    };
}
function initFilterByActiveExample(vm) {
    vm.activeFilterState = "All";
    vm.exampleVendors = [
        {
            name: "Active Vendor 1",
            isActive: true
        },
        {
            name: "Active Vendor 2",
            isActive: true
        },
        {
            name: "Inactive Vendor 3",
            isActive: false
        }
    ];
}
function initViewEditCheckboxExample(vm) {
    vm.checkboxEditable = false;
    vm.defaultCheckboxValue = true;
    vm.toggleCheckboxEditable = function toggleCheckboxEditable() {
        vm.checkboxEditable = !vm.checkboxEditable;
    };
}
function initViewEditContactExample(vm) {
    vm.contactEditable = false;
    vm.exampleContact = {
        name: "Hal 9000",
        email: "hal@uiuc.edu",
        phoneNumber: "333-4444"
    };
    vm.toggleContactEditable = function toggleContactEditable() {
        vm.contactEditable = !vm.contactEditable;
    };
}
function initViewEditNumberExample(vm) {
    vm.numberFieldEditable = false;
    vm.defaultNumberEditValue = 123;
    vm.toggleNumberFieldEditable = function toggleNumberFieldEditable() {
        vm.numberFieldEditable = !vm.numberFieldEditable;
    };
}
function initViewEditTextAreaExample(vm) {
    vm.textAreaEditable = false;
    vm.defaultTextAreaValue = "Default Text Area Value";
    vm.toggleTextAreaEditable = function toggleTextAreaEditable() {
        vm.textAreaEditable = !vm.textAreaEditable;
    };
}
function initViewEditTextFieldExample(vm) {
    vm.textFieldEditable = false;
    vm.defaultTextEditValue = "Default Text Field Value";
    vm.toggleTextFieldEditable = function toggleTextFieldEditable() {
        vm.textFieldEditable = !vm.textFieldEditable;
    };
}
function initViewEditYesNoOtherExample(vm) {
    vm.yesNoOtherEditable = false;
    vm.defaultYesNoOtherValue = "Yes";
    vm.toggleYesNoOtherEditable = function toggleTextFieldEditable() {
        vm.yesNoOtherEditable = !vm.yesNoOtherEditable;
    };
}
function initViewEditDate(vm, $scope) {
    vm.dateEditable = false;

    vm.toggleDateEditable = function toggleDateEditable() {
        vm.dateEditable = !vm.dateEditable;
    };
}

angular.module('carli.sections.styleGuide')
    .controller('styleGuideController', styleGuideController);

function styleGuideController(componentExamples, componentGatherer) {
    var vm = this;
    var basePath = '/carliApp/sections/styleGuide/examples/';

    vm.contactEditable = false;
    vm.textFieldEditable = false;
    vm.defaultTextEditValue = "Default Text Field Value";
    vm.textAreaEditable = false;
    vm.defaultTextAreaValue = "Default Text Area Value";
    vm.numberFieldEditable = false;
    vm.defaultNumberEditValue = 123;
    vm.checkboxEditable = false;
    vm.defaultCheckboxValue = true;

    vm.toggleContactEditable = function toggleContactEditable () {
        vm.contactEditable = !vm.contactEditable;
    };
    vm.toggleTextFieldEditable = function toggleTextFieldEditable () {
        vm.textFieldEditable = !vm.textFieldEditable;
    };
    vm.toggleTextAreaEditable = function toggleTextAreaEditable () {
        vm.textAreaEditable = !vm.textAreaEditable;
    };
    vm.toggleNumberFieldEditable = function toggleNumberFieldEditable () {
        vm.numberFieldEditable = !vm.numberFieldEditable;
    };
    vm.toggleCheckboxEditable = function toggleCheckboxEditable () {
        vm.checkboxEditable = !vm.checkboxEditable;
    };

    vm.components = componentGatherer.gather(componentExamples, basePath);

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

    vm.exampleContact = {
        name: "Hal 9000",
        email: "hal@uiuc.edu",
        phoneNumber: "333-4444"
    };

    vm.activeFilterState = "All";
}

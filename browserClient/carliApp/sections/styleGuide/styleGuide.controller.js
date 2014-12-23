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
    initViewEditPercentageExample(vm);
    initViewEditTextAreaExample(vm);
    initViewEditTextFieldExample(vm);
    initViewEditTypeaheadExample(vm);
    initViewEditYesNoOtherExample(vm);
    initViewEditDate(vm);
    initEntityList(vm);
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
}function initViewEditPercentageExample(vm) {
    vm.percentageFieldEditable = false;
    vm.defaultPercentageEditValue = 55;
    vm.togglePercentageFieldEditable = function togglePercentageFieldEditable() {
        vm.percentageFieldEditable = !vm.percentageFieldEditable;
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
function initViewEditTypeaheadExample(vm) {
    vm.typeaheadEditable = false;
    vm.typeaheadExampleValue = "";
    vm.exampleOptionsList = [
        { 'name': 'Option 1' },
        { 'name': 'Another Option' },
        { 'name': 'Lorem Ipsum' },
        { 'name': 'Foobar' }
    ];
    vm.toggleTypeaheadEditable = function toggleTypeaheadEditable() {
        vm.typeaheadEditable = !vm.typeaheadEditable;
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
function initEntityList(vm){
    vm.exampleEntities = [
        {
            name: 'Entity 1',
            url: 'entity1.example.com',
            isActive: true,
            property: 'An example property'
        },
        {
            name: 'Entity 2',
            url: 'entity2.example.com',
            isActive: true,
            property: 'Example property two'
        },
        {
            name: 'Another Entity',
            url: 'www.example.com',
            isActive: true,
            property: 'Another example property'
        },
        {
            name: 'Inactive Entity',
            url: 'www.example.com/inactive',
            isActive: false,
            property: 'Another example property'
        },
        {
            name: 'Lorem Upsum',
            url: 'aaa.example.com',
            isActive: true,
            property: 'Property for example'
        }
    ];
    vm.exampleColumnConfig = [
        {
            label: "Entity Name",
            orderByProperty: 'name',
            contentFunction: function(entity) {
                return entity.name;
            }
        },
        {
            label: "Entity URL",
            orderByProperty: 'url',
            contentFunction: function(entity) {
                return entity.url;
            }
        },
        {
            label: "Other Property",
            orderByProperty: 'property',
            contentFunction: function(entity) { return entity.property; }
        }
    ];
}
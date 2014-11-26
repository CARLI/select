/* ---------- General Utility Functions ---------- */
function toString( val ){
    return val + '';
}

/* ---------- Element Finder Helper Functions ---------- */
function elementById( id ){
    return element(by.id(id));
}

function elementByModel( modelName ){
    return element(by.model( modelName ));
}

function inputByModelElementFinder( modelName ){
    return elementByModel( modelName ).element(by.tagName('input'));
}

function selectByModelElementFinder( modelName ){
    return elementByModel( modelName ).element(by.tagName('select'));
}

function currentlySelectedOptionElementFinder( elementFinder ){
    return elementFinder.element(by.css('option:checked'));
}

function textareaByModelElementFinder( modelName ){
    return elementByModel( modelName ).element(by.tagName('textarea'));
}

function radioGroupInputsByModelElementFinder( modelName ){
    return element.all(by.model( modelName )).all(by.tagName('input'))
}


/* ---------- Element Interaction Helper Functions ---------- */

function setInputValue( elementFinder, value ){
    elementFinder.clear();
    elementFinder.sendKeys( value );
}

function setCheckboxValue( elementFinder, newCheckedState ){
    elementFinder.getAttribute('checked').then( function(checkedState){
        var checkboxIsChecked = !(checkedState === null);

        // Only click the checkbox if it's already checked and we want it un-checked,
        // or it's not already checked but it should be.
        if( checkboxIsChecked && !newCheckedState ||
           !checkboxIsChecked &&  newCheckedState){
            elementFinder.click();
        }
        // Otherwise it's already in the appropriate state. Leave it alone.
    });
}

function setSelectValue( elementFinder, optionText ){
    // Works in Firefox, not Chrome:  // elementFinder.sendKeys(optionText);
    // Works in Chrome, not Firefox:  // elementFinder.element(by.cssContainingText('option', optionText)).click();
    elementFinder.all(by.tagName('option'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return (text.search(optionText) > -1);
            });
        })
        .then(function (options) {
            options[0].click();
        });
}

function setRadioGroupValueByIndex( elementFinder, index ){
    elementFinder.get(index).click();
}


/* ---------- Element Assertion Helper Functions ---------- */

function ensureElementIsPresent(elementFinder, description) {
    it('should have a ' + description, function () {
        expect(elementFinder.isPresent()).toBe(true);
    });
}

function ensureElementsArePresent(elementArrayFinder, description) {
    it('should have ' + description, function () {
        elementArrayFinder.then(function (items) {
            expect(items.length).toBeGreaterThan(0);
        });
    });
}

function ensureElementIsHidden(elementFinder, description) {
    it('should have a hidden ' + description, function () {
        expect(elementFinder.isDisplayed()).toBe(false);
    });
}

function ensureElementsAreHidden(elementArrayFinder, description) {
    it('should have hidden ' + description, function () {
        elementArrayFinder.then(function (items) {
            for (var i = 0; i < items.length; i++) {
                expect(items[i].isDisplayed()).toBe(false);
            }
        });
    });
}

function ensureInputIsBlank( elementFinder, description ){
    it('should have a blank ' + description, function(){
        expect( elementFinder.getAttribute('value')).toBe('');
    });
}

function ensureSelectIsBlank( elementFinder, description ){
    it('should have a blank ' + description, function () {
        //expect ? because that's what Angular puts be default for the empty option (when nothing is set in the model by default)
        expect(elementFinder.getAttribute('value')).toBe('?');
    });
}

function ensureCheckboxIsBlank( elementFinder, description ){
    it('should have a blank ' + description, function () {
        // expect null because Protractor returns 'true' if checked and null if not
        expect(elementFinder.getAttribute('checked')).toBe(null);
    });
}

function ensureRadioGroupIsBlank( elementFinder, description ){
    it('should have a blank ' + description, function () {
        //expect(elementFinder.getAttribute('checked')).toBe(null);
        //TODO: determine if radio is in default state.
        //need an index to count as blank and maybe a mapping of index -> values
    });
}

function ensureElementHasText( elementFinder, description, testText ) {
    it(description + ' should display "' + testText + '"', function(){
        expect(elementFinder.getText()).toBe( toString(testText) );
    });
}

function ensureInputHasValue( elementFinder, description, testValue ) {
    it(description + ' should have value "' + testValue + '"', function(){
       expect(elementFinder.getAttribute('value')).toBe( toString(testValue) );
    });
}

function ensureCheckboxIsChecked( elementFinder, description, testValue ) {
    it(description + ' should ' + (testValue ? '' : 'not ') + 'be checked', function(){
        expect(elementFinder.getAttribute('checked')).toBe( testValue ? 'true' : null );
    });
}

function ensureSelectHasValue( elementFinder, description, testValue ) {
    it(description + ' should have "' + testValue + '" selected', function(){
        expect( currentlySelectedOptionElementFinder(elementFinder).getText()).toBe( toString(testValue) );
    });
}

function ensureRadioGroupValueByIndex( elementFinder, description, testValue, testIndex ) {
    it(description + ' should have chosen value "' + testValue + '"', function(){
        expect( elementFinder.get(testIndex).getAttribute('checked') ).toBe('true');
    });
}

/* ---------- Test Shortcut Helper Functions ---------- */
function _elementFinderForConfig( config ){
    if ( !config ){
        throw new Error('elementFinderForConfig missing config');
    }
    if ( !config.description ){
        throw new Error('elementFinderForConfig bad config: missing description');
    }
    if ( !config.type ){
        throw new Error('elementFinderForConfig bad config: missing type');
    }
    if ( !config.model ){
        throw new Error('elementFinderForConfig bad config: missing model');
    }

    switch( config.type ){
        case 'input':
        case 'checkbox':
            return inputByModelElementFinder( config.model );
            break;
        case 'textarea':
            return textareaByModelElementFinder( config.model );
            break;
        case 'select':
            return selectByModelElementFinder( config.model );
            break;
        case 'radio':
            return radioGroupInputsByModelElementFinder( config.model );
            break;
        default:
            throw new Error('elementFinderForConfig unknown type: ' + config.type);
    }
}

function ensureFormElementIsPresentAndBlank( config ){
    var elementFinder = _elementFinderForConfig( config );

    if ( config.type === 'radio' ){
        ensureElementsArePresent( elementFinder, config.description + ' radio group' );
    }
    else {
        ensureElementIsPresent( elementFinder, config.description + ' input');
    }

    switch( config.type ){
        case 'input':
        case 'textarea':
            ensureInputIsBlank( elementFinder, config.description + ' input field');
            break;
        case 'checkbox':
            ensureCheckboxIsBlank( elementFinder, config.description + ' checkbox');
            break;
        case 'select':
            ensureSelectIsBlank( elementFinder, config.description + ' select');
            break;
        case 'radio':
            ensureRadioGroupIsBlank( elementFinder, config.description + ' radio group');
            break;
        default:
            throw new Error('ensureFormElementIsPresentAndBlank unknown type: ' + config.type);
    }
}

function ensureFormElementIsHidden( config ){
    var elementFinder = _elementFinderForConfig( config );

    if ( config.type === 'radio' ){
        ensureElementsAreHidden( elementFinder, config.description + ' radio group');
    }
    else {
        ensureElementIsHidden( elementFinder, config.description + ' input');
    }
}

function ensureFormElementDisplaysText( config, testText ){
    var elementFinder = elementByModel( config.model );
    ensureElementHasText( elementFinder, config.description, testText );
}

function setFormElementValue( config, value ){
    var elementFinder = _elementFinderForConfig( config );

    switch( config.type ){
        case 'input':
        case 'textarea':
            setInputValue( elementFinder, value );
            break;
        case 'checkbox':
            setCheckboxValue( elementFinder, value );
            break;
        case 'select':
            setSelectValue( elementFinder, value );
            break;
        case 'radio':
            setRadioGroupValueByIndex( elementFinder, config.valueToIndex[value] );
            break;
        default:
            throw new Error('ensureFormElementIsPresentAndBlank unknown type: ' + config.type);
    }
}

function ensureFormElementHasValue( config, value ){
    var elementFinder = _elementFinderForConfig( config );

    switch( config.type ){
        case 'input':
        case 'textarea':
            ensureInputHasValue( elementFinder, config.description, value );
            break;
        case 'checkbox':
            ensureCheckboxIsChecked( elementFinder, config.description, value );
            break;
        case 'select':
            ensureSelectHasValue( elementFinder, config.description, value );
            break;
        case 'radio':
            ensureRadioGroupValueByIndex( elementFinder, config.description, value, config.valueToIndex[value] );
            break;
        default:
            throw new Error('ensureFormElementIsPresentAndBlank unknown type: ' + config.type);
    }
}


/* ---------- Shortcuts for calling jQuery helper verions of the test functions ---------- */
/*
 * These are the functions that Protractor runs in the browser to invoke the jQuery helpers.
 * They have a weird signature because it stringifies the function and parameters have
 * to be read from the `arguments` object.
 */
function callHelperInputHasValue(){
    var config = arguments[0] || {},
        configPropertyForValue = arguments[1] || 'defaultValue',
        expectedValue = config[configPropertyForValue];
    return CARLI.test.inputHasValue(config, expectedValue);
}

function callHelperComponentHasText(){
    var config = arguments[0] || {},
        configPropertyForText = arguments[1] || 'defaultValue',
        expectedValue = config[configPropertyForText];

    return CARLI.test.elementHasText( config, expectedValue );
}

/*
 * These are convenience methods to wrap browser helper calls in expects
 */
function browserEnsureInputHasValue( config, configPropertyForValue ){
    it(config.description + ' ' + config.type + ' should have default value "' + config[configPropertyForValue] + '"', function () {
        expect(browser.executeScript( callHelperInputHasValue, config, configPropertyForValue)).toBe(true);
    });
}

function browserEnsureComponentHasText( config, configPropertyForText ){
    it(config.description + ' should display "' + config[configPropertyForText] + '"', function () {
        expect(browser.executeScript( callHelperComponentHasText, config, configPropertyForText)).toBe(true);
    });
}

/* ---------------------- Exports ------------------------- */

module.exports = {
    toString: toString,

    elementById: elementById,
    elementByModel: elementByModel,
    inputByModel: inputByModelElementFinder,
    selectByModel: selectByModelElementFinder,
    selectedOption: currentlySelectedOptionElementFinder,
    textareaByModel: textareaByModelElementFinder,
    radioGroupInputsByModel: radioGroupInputsByModelElementFinder,

    setInputValue: setInputValue,
    setSelectValue: setSelectValue,
    setRadioGroupValue: setRadioGroupValueByIndex,

    ensureElementIsPresent: ensureElementIsPresent,
    ensureElementIsHidden: ensureElementIsHidden,
    ensureInputIsBlank: ensureInputIsBlank,
    ensureSelectIsBlank: ensureSelectIsBlank,
    ensureCheckboxIsBlank: ensureCheckboxIsBlank,
    ensureElementHasText: ensureElementHasText,
    ensureInputHasValue: ensureInputHasValue,

    ensureFormElementIsPresentAndBlank: ensureFormElementIsPresentAndBlank,
    ensureFormElementIsHidden: ensureFormElementIsHidden,
    ensureFormElementDisplaysText: ensureFormElementDisplaysText,
    setFormElementValue: setFormElementValue,
    ensureFormElementHasValue: ensureFormElementHasValue,

    browserEnsureInputHasValue: browserEnsureInputHasValue,
    browserEnsureComponentHasText: browserEnsureComponentHasText
};
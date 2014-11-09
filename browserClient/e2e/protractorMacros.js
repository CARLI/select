/* ---------- General Utility Functions ---------- */
function toString( val ){
    return val + '';
}

/* ---------- Element Finder Helper Functions ---------- */
function elementByModel( modelName ){
    return element(by.model( modelName ));
}

function inputByModelElementFinder( modelName ){
    return elementByModel( modelName ).element(by.tagName('input'));
}

function selectByModelElementFinder( modelName ){
    return elementByModel( modelName ).element(by.tagName('select'));
}

function currentlySelectedOptionByModelElementFinder( modelName ){
    return selectByModelElementFinder(modelName).element(by.css('option:checked'));
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

function setSelectValue( elementFinder, optionText ){
    elementFinder.element(by.cssContainingText('option', optionText)).click();
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
       expect(elementFinder.getAttribute('value')).toBe( testValue );
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
            // setCheckboxValue
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

/* ---------------------- Exports ------------------------- */

module.exports = {
    toString: toString,

    elementByModel: elementByModel,
    inputByModel: inputByModelElementFinder,
    selectByModel: selectByModelElementFinder,
    selectedOptionByModel: currentlySelectedOptionByModelElementFinder,
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
    setFormElementValue: setFormElementValue
};
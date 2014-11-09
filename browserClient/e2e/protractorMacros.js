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

function textareaByModelElementFinder( modelName ){
    return elementByModel( modelName ).element(by.tagName('textarea'));
}

function radioGroupInputsByModelElementFinder( modelName ){
    return element.all(by.model( modelName )).all(by.tagName('input'))
}

function currentlySelectedOptionByModelElementFinder( modelName ){
    return selectByModelElementFinder(modelName).element(by.css('option:checked'));
}

/* ---------- Element Interaction Helper Functions ---------- */

function setRadioGroupValue( elementFinder, index ){
    elementFinder.get( index).click();
}

function setSelectValue( elementFinder, optionText ){
    elementFinder.element(by.cssContainingText('option', optionText)).click();
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

/* ---------- Test Shortcut Helper Functions ---------- */
function _elementFinderForConfig( config ){
    if ( !config ){
        throw new Error('elementFinderForConfig missing config');
    }
    if ( !config.name ){
        throw new Error('elementFinderForConfig bad config: missing name');
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
        ensureElementsArePresent( elementFinder, config.name + ' radio group' );
    }
    else {
        ensureElementIsPresent( elementFinder, config.name + ' input');
    }

    switch( config.type ){
        case 'input':
        case 'textarea':
            ensureInputIsBlank( elementFinder, config.name + ' input field');
            break;
        case 'checkbox':
            ensureCheckboxIsBlank( elementFinder, config.name + ' checkbox');
            break;
        case 'select':
            ensureSelectIsBlank( elementFinder, config.name + ' select');
            break;
        case 'radio':
            ensureRadioGroupIsBlank( elementFinder, config.name + ' radio group');
            break;
        default:
            throw new Error('ensureFormElementIsPresentAndBlank unknown type: ' + config.type);
    }
}

function ensureFormElementIsHidden( config ){
    var elementFinder = _elementFinderForConfig( config );

    if ( config.type === 'radio' ){
        ensureElementsAreHidden( elementFinder, config.name + ' radio group');
    }
    else {
        ensureElementIsHidden( elementFinder, config.name + ' input');
    }
}


/* ---------------------- Exports ------------------------- */

module.exports = {
    toString: toString,

    elementByModel: elementByModel,
    inputByModel: inputByModelElementFinder,
    selectByModel: selectByModelElementFinder,
    textareaByModel: textareaByModelElementFinder,
    selectedOptionByModel: currentlySelectedOptionByModelElementFinder,

    setRadioGroupValue: setRadioGroupValue,
    setSelectValue: setSelectValue,

    ensureElementIsPresent: ensureElementIsPresent,
    ensureElementIsHidden: ensureElementIsHidden,
    ensureInputIsBlank: ensureInputIsBlank,
    ensureSelectIsBlank: ensureSelectIsBlank,
    ensureCheckboxIsBlank: ensureCheckboxIsBlank,

    ensureFormElementIsPresentAndBlank: ensureFormElementIsPresentAndBlank,
    ensureFormElementIsHidden: ensureFormElementIsHidden
};
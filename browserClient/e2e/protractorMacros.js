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

function contactEditorRowElementFinder( modelName, type, row ){
    return element(by.repeater("contact in " + modelName + " | filter:{ contactType: '" + type + "' }").row(row));
}

function contactEditorInputGroupElementFinder( contactEditorElementFinder){
    return {
        name: contactEditorElementFinder.all(by.model('contact.name')).get(0),
        email: contactEditorElementFinder.all(by.model('contact.email')).get(0),
        phoneNumber: contactEditorElementFinder.all(by.model('contact.phoneNumber')).get(0)
    };
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

function ensureContactEditorIsPresent(elementFinder, config) {
    it('should have ' + config.description + '  editor', function(){
        var row = contactEditorInputGroupElementFinder( elementFinder );
        expect(row.name.isPresent()).toBe(true);
        expect(row.phoneNumber.isPresent()).toBe(true);
        expect(row.email.isPresent()).toBe(true);
    })
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

function ensureContactEditorIsHidden( elementFinder, config ){
    it('should have a hidden ' + config.description + '  editor', function () {
        var row = contactEditorInputGroupElementFinder( elementFinder );
        expect(row.name.isDisplayed()).toBe(false);
        expect(row.phoneNumber.isDisplayed()).toBe(false);
        expect(row.email.isDisplayed()).toBe(false);
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

function ensureContactEditorIsBlank( elementFinder, config ) {
    it('should have a blank ' + config.description + '  editor', function(){
        var row = contactEditorInputGroupElementFinder( elementFinder );
        expect(row.name.getAttribute('value')).toBe('');
        expect(row.phoneNumber.getAttribute('value')).toBe('');
        expect(row.email.getAttribute('value')).toBe('');
    })
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
        case 'contact':
            //WARNING: the 0 means this is only getting the first row. So 'present', 'blank', and 'hidden' tests only test the first row.
            return contactEditorRowElementFinder( config.model, config.contactType, 0 );
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
    else if ( config.type === 'contact' ){
        ensureContactEditorIsPresent( elementFinder, config );
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
        case 'contact':
            ensureContactEditorIsBlank( elementFinder, config);
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
    else if ( config.type === 'contact' ){
        ensureContactEditorIsHidden( elementFinder, config );
    }
    else {
        ensureElementIsHidden( elementFinder, config.description + ' input');
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
    contactEditorRowByModel: contactEditorRowElementFinder,
    contactEditorInputs: contactEditorInputGroupElementFinder,

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
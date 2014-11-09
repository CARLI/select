function contactEditorRowElementFinder(modelName, type, row) {
    return element(by.repeater("contact in " + modelName + " | filter:{ contactType: '" + type + "' }").row(row));
}

function contactEditorInputGroupElementFinder(contactEditorElementFinder) {
    return {
        name: contactEditorElementFinder.all(by.model('contact.name')).get(0),
        email: contactEditorElementFinder.all(by.model('contact.email')).get(0),
        phoneNumber: contactEditorElementFinder.all(by.model('contact.phoneNumber')).get(0)
    };
}

function ensureContactEditorRowIsPresent(elementFinder, config) {
    it('should have ' + config.description + '  editor', function () {
        var row = contactEditorInputGroupElementFinder(elementFinder);
        expect(row.name.isPresent()).toBe(true);
        expect(row.phoneNumber.isPresent()).toBe(true);
        expect(row.email.isPresent()).toBe(true);
    })
}

function ensureContactEditorRowIsHidden(elementFinder, config) {
    it('should have a hidden ' + config.description + '  editor', function () {
        var row = contactEditorInputGroupElementFinder(elementFinder);
        expect(row.name.isDisplayed()).toBe(false);
        expect(row.phoneNumber.isDisplayed()).toBe(false);
        expect(row.email.isDisplayed()).toBe(false);
    });
}

function ensureContactEditorRowIsBlank(elementFinder, config) {
    it('should have a blank ' + config.description + '  editor', function () {
        var row = contactEditorInputGroupElementFinder(elementFinder);
        expect(row.name.getAttribute('value')).toBe('');
        expect(row.phoneNumber.getAttribute('value')).toBe('');
        expect(row.email.getAttribute('value')).toBe('');
    })
}


function ensureContactEditorIsPresentAndBlank(config) {
    var elementFinder, row;
    var numberOfRowsToCheck = config.rows || 1;

    for (row = 0; row < numberOfRowsToCheck; row++) {
        elementFinder = contactEditorRowElementFinder(config.model, config.filterString, row);
        ensureContactEditorRowIsPresent(elementFinder, config);
        ensureContactEditorRowIsBlank(elementFinder, config);
    }
}

function ensureContactEditorIsHidden(config) {
    var elementFinder, row;
    var numberOfRowsToCheck = config.rows || 1;

    for (row = 0; row < numberOfRowsToCheck; row++) {
        elementFinder = contactEditorRowElementFinder(config.model, config.filterString, row);
        ensureContactEditorRowIsHidden(elementFinder, config);
    }
}

function fillInContactRow( config, row, data ){
    var elementFinder = contactEditorRowElementFinder(config.model, config.filterString, row);
    var inputs = contactEditorInputGroupElementFinder( elementFinder );

    inputs.name.clear();
    inputs.name.sendKeys( data.name );

    inputs.email.clear();
    inputs.email.sendKeys( data.email );

    inputs.phoneNumber.clear();
    inputs.phoneNumber.sendKeys( data.phoneNumber );
}

/* ---------------------- Exports ------------------------- */

module.exports = {
    contactEditorRowByModel: contactEditorRowElementFinder,
    contactEditorInputs: contactEditorInputGroupElementFinder,

    ensureContactEditorRowIsPresent: ensureContactEditorRowIsPresent,
    ensureContactEditorRowIsHidden: ensureContactEditorRowIsHidden,
    ensureContactEditorRowIsBlank: ensureContactEditorRowIsBlank,

    ensureContactEditorIsPresentAndBlank: ensureContactEditorIsPresentAndBlank,
    ensureContactEditorIsHidden: ensureContactEditorIsHidden,

    fillInContactRow: fillInContactRow
};
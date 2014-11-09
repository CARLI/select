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

function ensureContactEditorIsPresent(elementFinder, config) {
    it('should have ' + config.description + '  editor', function(){
        var row = contactEditorInputGroupElementFinder( elementFinder );
        expect(row.name.isPresent()).toBe(true);
        expect(row.phoneNumber.isPresent()).toBe(true);
        expect(row.email.isPresent()).toBe(true);
    })
}

function ensureContactEditorIsHidden( elementFinder, config ){
    it('should have a hidden ' + config.description + '  editor', function () {
        var row = contactEditorInputGroupElementFinder( elementFinder );
        expect(row.name.isDisplayed()).toBe(false);
        expect(row.phoneNumber.isDisplayed()).toBe(false);
        expect(row.email.isDisplayed()).toBe(false);
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


function ensureContactEditorIsPresentAndBlank( config ){
    var elementFinder = contactEditorRowElementFinder( config.model, config.filterString, 0 );
    ensureContactEditorIsPresent( elementFinder, config );
    ensureContactEditorIsBlank( elementFinder, config );
}
/* ---------------------- Exports ------------------------- */

module.exports = {
    contactEditorRowByModel: contactEditorRowElementFinder,
    contactEditorInputs: contactEditorInputGroupElementFinder,

    ensureContactEditorIsPresent: ensureContactEditorIsPresent,
    ensureContactEditorIsHidden: ensureContactEditorIsHidden,
    ensureContactEditorIsBlank: ensureContactEditorIsBlank,

    ensureContactEditorIsPresentAndBlank: ensureContactEditorIsPresentAndBlank
};
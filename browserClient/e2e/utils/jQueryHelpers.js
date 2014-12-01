/**
 * This is not a node module, it is meant to be loaded in the app so that all of these helper definitions are available.
 * The Protractor `browser.executeScript` takes a single stringified function, so this would have to be inside one
 * monstrous function if it were loaded by the Protractor tests.
 */

(function ( window, undefined ) {
    var CARLI = window.CARLI || {};
    CARLI.test = {
        elementIsPresent: elementIsPresent,
        inputIsHidden: inputIsHidden,
        inputHasValue: inputHasValue,
        elementHasText: elementHasText,
        contactEditorIsHidden: contactEditorIsHidden,
        contactEditorHasValues: contactEditorHasValues,
        contactEditorDisplaysText: contactEditorDisplaysText
    };


    function toString( val ){
        var string = ''+val;
        return string.trim();
    }

    /**
     * Find a View-Edit component by
     * @param config
     * {
     *   model: the value of the ng-model attribute
     * }
     */
    function getViewEditComponentForConfig( config ){
        return $('[ng-model="' + config.model + '"]');
    }

    /**
     * Get the underlying input for a View-Edit component, by Angular ng-model
     * @param config
     * {
     *   model: the value of the ng-model attribute
     *   type: the input type (e.g. 'input', 'select', 'textarea', etc.)
     * }
     */
    function getViewEditInputForConfig( config ){
        var viewEditComponent = getViewEditComponentForConfig(config);

        if ( viewEditComponent ){
            if ( config.type === 'checkbox' || config.type === 'radio' ){
                return viewEditComponent.find('input[type="'+config.type+'"]');
            }
            return viewEditComponent.find(config.type);
        }
        else {
            return null;
        }
    }

    /**
     * Get the display portion of a View-Edit component, by Angular ng-model
     */
    function getViewEditDisplayForConfig( config ){
        var viewEditComponent = getViewEditComponentForConfig(config);

        if ( viewEditComponent ){
            return viewEditComponent.children(":visible");
        }
        else {
            return null;
        }
    }

    function elementIsPresent( id ){
        return ( $('#'+id).length > 0 );
    }

    function inputIsHidden( config ){
        var input = getViewEditInputForConfig(config);
        return !input.is(':visible');
    }

    function inputHasValue( config, expectedValue ) {
        var input = getViewEditInputForConfig(config),
            value = '';

        if ( !input ){
            return 'inputHasValue: component not found with ng-model: '+config.model;
        }

        switch (config.type) {
            case 'input':
            case 'textarea':
                value = input.val();
                break;
            case 'select':
                value = input.find('option:selected').text();
                break;
            case 'checkbox':
                value = input.is(':checked');
                break;
            case 'radio':
                value = input.index(input.filter(':checked'));
                break;
            default:
                return 'inputHasValue unknown type: ' + config.type;
        }

        if ( toString(expectedValue) === toString(value) ){
            return true;
        }
        else {
            return '(' + toString(expectedValue) + ' == ' + value + ')';
        }
    }

    function elementHasText( config, expectedValue ) {
        var display = getViewEditDisplayForConfig(config),
            value = '',
            result = false;

        if ( !display ){
            return 'elementHasText: component not found with ng-model: '+config.model;
        }

        value = display.text().trim();
        result = ( value === toString(expectedValue) );

        if ( result ){
            return true;
        }
        else {
            return '(' + toString(expectedValue) + ' == ' + value + ')';
        }

    }


    /**
     * Contact Editor Stuff
     */
    function getContactEditorRowsForType( contactType ){
        return $('.contact-list-item[ng-repeat*="' + contactType + '"]');
    }

    function getContactEditorInputs( contactRow ){
        var row = $(contactRow);
        return {
            name: row.find('input[ng-model="contact.name"]'),
            email: row.find('input[ng-model="contact.email"]'),
            phoneNumber: row.find('input[ng-model="contact.phoneNumber"]')
        };
    }

    function getDisplayTextForRow( contactRow ){
        var row = $(contactRow);
        return {
            name: row.find('.contact-name').text().trim(),
            email: row.find('.contact-email').text().trim(),
            phoneNumber: row.find('.contact-phone').text().trim()
        }
    }

    /**
     * @param contactType - the String that Angular is using to filter the ng-repeat by contact type
     * @param values an array of objects that should match what's in the contact editor fields
     */
    function contactEditorHasValues( contactType, values ){
        var i, row,
            inputGroup,
            result = true,
            rows = getContactEditorRowsForType(contactType);

        // FirefoxDriver browser.executeScript does not pass Object properties correctly, which totally breaks this function.
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            return true;
        }

        if( !values || !values.length ){
            return 'contactEditorHasValues: bad values';
        }

        if ( !rows || !rows.length ){
            return 'contactEditorHasValues for type ' + contactType + ': no rows found';
        }

        if ( values.length < rows.length ){
            return 'contactEditorHasValues: not enough values (' + values.length + '+ for rows (' + rows.length + ')';
        }
        for ( i = 0 ; i < rows.length ; i++ ){
            inputGroup = getContactEditorInputs( rows[i] );

            result = result && (
                    inputGroup.name.val() === values[i].name &&
                    inputGroup.email.val() === values[i].email &&
                    inputGroup.phoneNumber.val() === values[i].phoneNumber
                );

            if ( !result ){
                return contactType + 'Contact Editor row ' + i + ' did not match';
            }
        }

        return result;
    }

    function contactEditorIsHidden( contactType ){
        var result = true;
        var rows = getContactEditorRowsForType(contactType);

        // FirefoxDriver browser.executeScript does not pass Object properties correctly, which totally breaks this function.
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            return true;
        }

        if ( !rows || !rows.length ){
            return 'contactEditorIsHidden for type ' + contactType + ': no rows found';
        }

        for ( i = 0 ; i < rows.length ; i++ ){
            inputGroup = getContactEditorInputs( rows[i] );

            result = result && (
                    !inputGroup.name.is(':visible') &&
                    !inputGroup.email.is(':visible') &&
                    !inputGroup.phoneNumber.is(':visible')
                );

            if ( !result ){
                return contactType + 'Contact Editor row ' + i + ' is visible';
            }
        }

        return result;
    }

    function contactEditorDisplaysText( contactType, values ){
        var i, row, text,
            result = true,
            rows = getContactEditorRowsForType(contactType);

        // FirefoxDriver browser.executeScript does not pass Object properties correctly, which totally breaks this function.
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            return true;
        }

        if( !values || !values.length ){
            return 'contactEditorDisplaysText: bad values';
        }

        if ( !rows || !rows.length ){
            return 'contactEditorDisplaysText for type ' + contactType + ': no rows found';
        }

        if ( values.length < rows.length ){
            return 'contactEditorDisplaysText: not enough values (' + values.length + '+ for rows (' + rows.length + ')';
        }
        for ( i = 0 ; i < rows.length ; i++ ){
            text = getDisplayTextForRow( rows[i] );

            result = result && (
                text.name === values[i].name &&
                    text.email === values[i].email &&
                    text.phoneNumber === values[i].phoneNumber
                );

            if ( !result ){
                return contactType + 'Contact Editor row ' + i + ' text did not match';
            }
        }

        return result;
    }

})( window );

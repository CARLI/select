
function validate(data) {
    if (data === undefined) {
        throw new Error('Validator.validate() requires data');
    }
    if (data.type === undefined) {
        throw new Error('Validator.validate(data): data requires type');
    }
    if (data.type === 'foobar') {
        throw new Error('Validator.validate(data): unrecognized type "' + data.type + '"');
    }
    return !(data.name === undefined);
}

module.exports = {
    validate: validate
};

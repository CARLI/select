
var userRepository = require('../../CARLI/Entity/UserRepository');

function list() {
    return userRepository.list();
}

module.exports = {
    list: list
};

var fs = require('fs');

module.exports = function (grunt) {
    grunt.registerTask('jsenv', setJsEnv);

    function setJsEnv(env) {
        switch (env) {
            case 'browser':
                writeCarliRequestModule('browser-request');
                break;
            case 'node':
                writeCarliRequestModule('request');
                break;
            default:
                throw Error('Invalid environment: ' + env + ', valid options are "node" and "browser"');
        }
    }
};

function writeCarliRequestModule(module) {
    fs.writeFileSync(__dirname + '/../CARLI/carliRequest.js', "module.exports = require('"+ module +"');\n");
}


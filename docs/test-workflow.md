# Test Workflow

There are several parts of the app that have their own style of tests and their own way of running those tests. The sections below detail setup, commands, and workflow suggestions for each part.


## CARLI Modules

The code in the __CARLI/__ directory is organized into Node modules. They each have their own test file which should follow the naming convention _ModuleName_.spec.js. 
The tests are meant to be run using the _Mocha_ framework and the _Chai_ assertion library. Both of these packages are required (see package.json) and will be installed by calling `npm install` in the __CARLI/__ directory.


### Running the tests with Mocha

To run the tests, invoke the `mocha` command with the list of test files to run.
* To test a particular module: `mocha ModuleName.spec.js`
* To test all modules: `mocha *.spec.js`


## Browser Client - Component Unit Tests

When working on components in the __browserClient/__ directory, there are several options for running tests. Grunt will automatically run tests while the development server is running  

### Grunt Serve 
automatically starts background Karma server and runs tests when .spec files change

### Stand-alone karma server
workflow for running unit tests on demand

### IDE Setup 
grunt task to generate karma.conf


## Browser Client - Section End-To-End Tests






## ABOUT

* .spec files - why they are called that
* Karma - what it is
* Protractor

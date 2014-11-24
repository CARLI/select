# Test Workflow

There are several parts of the app that have their own style of tests and their own way of running those tests. The sections below detail setup, commands, and workflow suggestions for each part.


## CARLI Modules

The code in the __CARLI/__ directory is organized into Node modules. They each have their own test file which should follow the naming convention _ModuleName_.spec.js and reside in the __test/__ directory. 
The tests are meant to be run using the _Mocha_ framework and the _Chai_ assertion library. Both of these packages are required (see package.json) and will be installed by calling `npm install` in the __CARLI/__ directory.



### Running the tests with Mocha

To run the tests, invoke the `mocha` command with the list of test files to run. The default behavior of Mocha is to run all tests under the __test__ directory.
* To test all modules: `mocha`
* To test a particular module: `mocha test/ModuleName.spec.js`



## Browser Client - Component Unit Tests

* To run all unit tests once: `grunt test:unit`

When working on components in the __browserClient/__ directory, there are several options for running tests. Grunt will automatically run tests while the development server is running. 
For running these tests, Karma is used to set up an environment that mimics running the code and tests in a web browser. 
PhantomJS is a headless web browser that loads the environment set up by Karma and runs the tests in a WebKit environment. Karma can be configured to stay running for repeated tests or it do a single run.  


### Grunt Serve 
The 'grunt serve' command automatically starts a background Karma server and runs tests whenever .spec files change in the carliApp directory. Keep an eye on the terminal window that started the server to see test output there. 


### Stand-alone karma server

If you have not yet run `grunt serve` you will need to run `grunt generate-karmaconf` to set up the stand-alone Karma configuration file.

If you are not using the development server (`grunt serve`) you can just run Karma and then run the tests on demand. 
First run `grunt karma:unit` which will start the Karma server and leave it running. Then in another terminal you can run `grunt karma:unit:run` to run the tests and see the output. 


### Single Run

You can just run `grunt test:unit` to build the project and run the tests once. This builds everything needed to run the tests.


### JetBrains IDE Setup 

If you have not yet run `grunt serve` you will need to run `grunt generate-karmaconf` to set up the stand-alone Karma configuration file.

To run the Component unit tests in a JetBrains IDE you must first install the Karma plugin.

Follow the directions from [the JetBrains docs](https://www.jetbrains.com/idea/webhelp/running-unit-tests-on-karma.html). The important configurations are the location of your Node executable and the Karma installed in the project.  


## Browser Client - Section End-To-End Tests

* To run all end-to-end tests once: `grunt test:e2e`
* To run individual end-to-end tests: `grunt test:e2e:<spec-name>`

### Run All End-To-End Tests
You can just run `grunt test:e2e` to build the project and run the end-to-end tests once.

### Run Specific End-To-End Tests
You can specify one or more individual spec files to run by appending the file name(s) to the grunt test:e2e command using colons.
Example:

* `grunt test:e2e:vendor` - would run just the e2e/vendor.spec.js file.
* `grunt test:e2e:vendor:styleGuide` - would run both the e2e/vendor.spec.js and the e2e/styleGuide.spec.js files. 

### Grunt Protractor Server
The `grunt serve:protractor` command automatically starts a background Protractor (webdriver-manager) server. To run specific end-to-  end tests, run `protractor --specs <files>` in the browserClient directory.


## ABOUT

* .spec files - why they are called that
* Protractor


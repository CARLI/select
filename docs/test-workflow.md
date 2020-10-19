# Test Workflow

There are several parts of the app that have their own style of tests and their own way of running those tests. The sections below detail setup, commands, and workflow suggestions for each part.


## CARLI Modules

The code in the __CARLI/__ directory is organized into Node modules. They each have their own test file which should follow the naming convention _ModuleName_.spec.js and reside in the __test/__ directory. 
The tests are meant to be run using the _Mocha_ framework and the _Chai_ assertion library. Both of these packages are required (see package.json) and will be installed by calling `npm install` in the __CARLI/__ directory.



### Running the tests with Mocha

To run the tests, invoke the `mocha` command with the list of test files to run. The default behavior of Mocha is to run all tests under the __test__ directory.
* To test all modules: `mocha`
* To test a particular module: `mocha test/ModuleName.spec.js`


#### Note Regarding CARLI Modules test setup

There is a fairly significant amount of infrastructure in place to run the tests with a different configuration from the
normal app. There is a file in __CARLI/test/__ called utils.js which has code to set up a test version of the DataStore, and
to delete databases created during test runs. The `grunt test` task (see __CARLI/Gruntfile.js__) creates the test database.

Actually using the test database is accomplished by setting the Store of an Entity Repository to the test store exported
by the utils module. At present this is only done in __CARLI/test/Entity/EntityInterface.spec.js__ and in
__CARLI/test/CouchDbStore.spec.js__. Technically, the Entity Repository tests (i.e. 'Library', 'Product', 'Vendor', etc.)
depend on these same settings being correct, and are implicitly relying on those two tests being run first.



## Browser Client - Component Unit Tests

There are a few .spec.js files in the browserClient/ source. These were Karma unit tests for some of the Angular code that
are no longer run, but could give some hint of how the code works.



## Full Test Workflow 9-24-20

1. basically just docker run -d --name carli-couchdb -p 5984:5984 --restart=always couchdb:1.6.1 
(remove the restart part if you don't want it running all the time)

2. then bop to http://localhost:5984/_utils and click the fix admin party thing in the bottom right
  
   make a .env file in the CARLI folder
   COUCH_DB_HOST="localhost:5984"
   COUCH_DB_PASSWORD="chicken"
   COUCH_DB_URL_SCHEME="http://"
   COUCH_DB_USER="admin"

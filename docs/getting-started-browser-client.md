# Getting Started #

These instructions will get you started working on the browser client (Front End).


## Install Node ##
The development environment depends heavily on Node and npm.
Visit the [Node Web Site](http://nodejs.org/) for installation instructions.


## Install Dependencies ##
In the browserClient/ directory, run:

* `npm install`
* `npm install -g grunt-cli`
* `npm install -g bower`
* `bower install`


## Start Local Dev Server ##
To build the project and start a local development server:
* `grunt serve`

This should open in a new browser window / tab.  
 

## Live Reloading ##
The development server will auto-refresh when pertinent project files are changed.
Keep an eye on the terminal window to see what happens. Different tasks are run depending on which type of file changed:

* Gruntfile.js - the Gruntfile is reloaded
* Any .js file in carliApp/ - the file will be linted and karma tests will run, then the server will reload.
* If any .js file is added or removed from carliApps/ then the server will reload with an updated index.html containing the correct script tags. (This may not be 100% working).
* If index.html changes the server reloads with the new index.html
* If any .spec.js (test files) change, they are linted and then karma will re-run the tests.


## Other Grunt Tasks ##
The following shortcut tasks are defined. See the [Gruntfile](../Gruntfile.js) for more details.

* `grunt build` - generates a clean build of the project. Files are copied to the __build/__ directory.
* `grunt test` - does a clean build then runs the tests. Outputs a junit XML file of the results.
* `grunt serve` - builds and starts a live-reloading server. Opens index.html in a browser window.
* `grunt compile` - does a clean build and packages the app for deployment. Files are copied into the __dist/__ directory.


## Technology Used ##
The following applications and projects are used to build the front-end, and to aid in development.

* Node - the JavaScript runtime that powers many of the rest of the tools and provides a local development server.
* Grunt - the task runner that automates building the project.
* Bower - a package manager for front-end libraries (Angular, Bootstrap, etc.)
* Karma - a test runner for JavaScript.
* Mocha and Chai - libraries for writing tests.
* PhantomJS - a headless WebKit browser environment in which to run tests.
* Angular - Superheroic JavaScript MVW Framework.
* Browserify - packages code using Node-style `requires` for the browser.

_See [package.json](package.json) and [bower.json](bower.json) for detailed dependency information_


### Code Style ###
The Angular application should follow the [Angular Style Guide] as closely as possible.

### Organization ###
* The client application is organized according to the [Google Best Practices Doc]
  * The __carliApp/__ directory contains index.html and main app config.
  * __carliApp/sections/__ contains a directory for each main section of the app and routing configuration for the sections.
  * __carliApp/components/__ contains a directory for each UI component (re-usable and otherwise).
  * Test files for all of the above live alongside the code they test, and end with .spec.js.


### Notes for Linux Users ###
* PhantomJS requires a freetype shared library to run.
Install if you get an error like "Can't start PhantomJS":
`sudo apt-get install libfreetype6 libfontconfig`


### Note for Debian and Ubuntu users installing Node via apt-get ###
See [this article](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager) for special installation steps.

[Google Best Practices Doc]: https://docs.google.com/a/pixotech.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/mobilebasic?pli=1
[Angular Style Guide]: https://github.com/toddmotto/angularjs-styleguide 

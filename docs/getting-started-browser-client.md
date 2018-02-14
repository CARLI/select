# Getting Started #

These instructions will get you started working on the browser client (Front End).
All of the instructions in this document, and all front-end work in general is done in
the browserClient/ directory. (It is called browser client because it is the part of the
app that runs in the browser. And it is a client of the API).

At present the project does not use a VM, so all development is done directly in your main OS.


## Install Node ##
The development environment depends heavily on Node and npm.
Visit the [Node Web Site](http://nodejs.org/) for installation instructions.


## Install Dependencies ##
In the browserClient/ directory, run:

* `npm install`
* `npm install -g grunt-cli`
* `npm install -g bower`
* `bower install`
* `gem install sass`

### CouchDB Setup ###

* On a Mac, the best way to install these is with [Homebrew](http://brew.sh/).  Install Homebrew following the
instructions on their website, then:
* `brew install couchdb`
    * During the install, instructions will be printed for how to start and stop couch.  The recommended way is to 
use OSX's launchctl facility.  To do so, copy the `homebrew.mxcl.couchdb.plist` file into your `~/Library/LaunchAgents/`
folder as instructed during the `brew install` process.  If you prefer, you can also start and stop CouchDB manually.

* mention futon
* initial setup for database (grunt tasks - deploy cycles, deploy design docs, deploy admin user)
* Import users (grunt task - imported from users.json)

### Nginx Setup ###

* `brew install nginx`
    * Again, you can choose to use the launchctl facility, or start and stop nginx manually.
    * Copy the nginx config file from `./docs/nginx.conf` over top of `/usr/local/etc/nginx/nginx.conf`.
    * Restart nginx, if it is running.
    * For authentication to work during local development, we have to add fake hostnames to our local system. To do so, 
edit your hosts file, on `sudo vim /etc/hosts` and add the following lines:
```
    127.0.0.1 staff.carli.local
    127.0.0.1 vendor.carli.local
    127.0.0.1 library.carli.local
```
    * After changing the hosts file, run `sudo dscacheutil -flushcache; sudo killall mDNSResponder` to make sure the
changes are seen by OSX.

#### launchctl aliases ####

If you choose to use launchctl to manage couch and/or nginx, the following aliases may be useful:

```
alias couchdb_start='launchctl load ~/Library/LaunchAgents/homebrew.mxcl.couchdb.plist'
alias couchdb_stop='launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.couchdb.plist'
alias nginx_start='launchctl load ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist'
alias nginx_stop='launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist'
```

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

* `grunt build` - generates a clean build of the project for the dev server. Files are copied to the __build/__ directory.
* `grunt test` - does a clean build then runs the tests. Outputs a junit XML file of the results.
* `grunt serve` - builds and starts a live-reloading server. Opens index.html in a browser window.
* `grunt compile` - packages and minifies the app for deployment. Files are copied into the __dist/__ directory.
* `grunt ngdoc` - build Angular JS documentaion for the application.


## Technology Used ##
The following applications and projects are used to build the front-end, and to aid in development.

* Node - the JavaScript runtime that powers many of the rest of the tools and provides a local development server.
* Grunt - the task runner that automates building the project.
* Bower - a package manager for front-end libraries (Angular, Bootstrap, etc.)
* Karma - a unit test runner for JavaScript.
* Mocha and Chai - libraries for writing tests.
* Protractor - an end-to-end test runner for JavaScript.
* PhantomJS - a headless WebKit browser environment in which to run tests.
* Angular - Superheroic JavaScript MVW Framework.
* Browserify - packages code using Node-style `requires` for the browser.

_See [package.json](package.json) and [bower.json](bower.json) for detailed dependency information_


## How to Add a New Front-End Third Party Dependency (Bower Module) ##
Since Bower is used to handle front end dependencies, it must be used when adding new ones. Follow these steps to do so:

* `bower install <package name>` - this will download the package and put it in bower_modules/
* If you are sure you will be using the package, use `bower install --save <package name>` instead. That will save it in bower.json
* Add the path to the file that should be included in the project to the 'vendor_files' section of build.config.js, inside the 'js' array.

If you want to update an existing dependency to a newer version, edit bower.json and increase the number next to the package name.


### Code Style ###
* The Angular application should follow the [Angular Style Guide] as closely as possible.
* JSDoc style documentation is built using ngdoc.  For details of how to write documentation comments, see [Writing AngularJS Documentation].

### Organization ###
The client application is organized according to the [Google Best Practices Doc].
Test files for all of the above live alongside the code they test, and end with .spec.js.

* The __carliApp/__ directory contains index.html and main app config.
* __carliApp/sections/__ contains a directory for each main section of the app and routing configuration for the sections.
    * These directories map to the top-level navigation of the site. They contain the minimal controller and template code to show the section. 
    * There are subdirectories for subsections.
* __carliApp/components/__ contains a directory for each UI component (re-usable and otherwise).
    * There is a directory for each component, which contain controllers, directives, services, and filters. Each in its own file.


### Notes for Linux Users ###
* PhantomJS requires a freetype shared library to run.
Install if you get an error like "Can't start PhantomJS":
`sudo apt-get install libfreetype6 libfontconfig`


### Note for Debian and Ubuntu users installing Node via apt-get ###
See [this article](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager) for special installation steps.

[Google Best Practices Doc]: https://docs.google.com/a/pixotech.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/mobilebasic?pli=1
[Angular Style Guide]: https://github.com/toddmotto/angularjs-styleguide 
[Writing AngularJS Documentation]: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation

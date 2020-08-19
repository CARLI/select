# Getting Started - DONT DO ANY OF THIS, THIS IS OUTDATED #

These instructions will get you started working on the CARLI selection system project.

The project does not use a VM, so all development is done directly in your main OS. You will need
to install several pieces of software to run the entire system locally:

* Node
* CouchDb
* Nginx
* MySQL (may be optional, see notes below)


## Install Node ##
The development environment depends heavily on Node and npm.
Visit the [Node Web Site](http://nodejs.org/) for installation instructions.


## Install Project Dependencies ##
In the root of the project run the bash script `install-dependencies.sh`. This descends into sub-directories and installs npm dependencies. 

You will need to install the sass library: `npm install -g sass`


## Set Up Config Files for the Application ##
There is a top-level directory called config which stores all run-time configuration for the applications. Included in the project are .template files which you can use to easily create the required config files, which are git-ignored. 
To do so, copy each of the .template file to a .json file by removing .template from the end of the copy. 

Recommended changes are the "notifications" section in local.json if you want to get alerts from the system at an email address.

Credentials for the Couch and MySQL databases are in secure.json. As you configure mysql and couch, you will add usernames and passwords for them here.

Run `grunt jsenv:node` this make sure the initial code for app configuration is generated.

### Setting up .env file for the middleware

The config/ directory contains some files that have fundamental values for most of the system. But the important details
for connecting to databases needs to be passed into the middleware using environment variables. The easiest way to do this
is with a .env file in the middleware/ directory. There is a sample file called sample.env in middleware/ which can be 
copied to .env and filled in with the appropriate variables.

When the middleware server starts up it dumps most of its configuration to the terminal, which helps to make sure your
environment variables are correct.

## Install and Configure CouchDB ##
On a Mac, the best way to install couch is with [Homebrew](http://brew.sh/).  Install Homebrew following the instructions on their website, then `brew install couchdb`

* During the install, instructions will be printed for how to start and stop couch.
* Couch includes a nice interactive utility called futon. It is available at http://localhost:5984/_utils/
* Couch is initially in "admin party" mode, you should make an admin user. Click the "fix this" link at the bottom right of the Futon screen. Enter an admin user and password. (Common defaults are admin / relax).
* Run `grunt deploy-db` ad `grunt deploy-design-docs` This will create the basic couch databases needed by the app. You will still need data.


## Install and Configure Nginx ##
Nginx is used as a proxy server so that the middleware, couchdb, and the three applications can all appear under one cohesive domain. Again, Homebrew is the best option for installing on a Mac.

* `brew install nginx`
    * A samply nginx config file for local development in included in the docs directory. Copy from `./docs/nginx.conf` to `/usr/local/etc/nginx/nginx.conf`, overwriting the original.
    * Restart nginx, if it is running.
    * For authentication to work during local development, we have to add fake hostnames to our local system. To do so, edit your hosts file, (`sudo vim /etc/hosts`) and add the following lines:
```
    127.0.0.1 staff.carli.local
    127.0.0.1 vendor.carli.local
    127.0.0.1 library.carli.local
```
    * After changing the hosts file, run `sudo dscacheutil -flushcache; sudo killall mDNSResponder` to make sure the changes are seen by OSX.


## Install MySQL ##
The CARLI applications talk to a separate MySQL database to get the list of CARLI customers (libraries). When developing locally you can use a local MySQL instance if you don't have access to the CARLI organization's internal development instance.

Install MySQL locally using Homebrew and start it. The username and password will go in `config/secure.json`. See the section on Application Configuration below for more information.

* _If you're lucky, someone can give you a mysql dump of the carli_crm database_ 


## Start Local Dev Server ##
To build the project and start a local development server, run `grunt serve` in the top-level of the project. This starts the middleware node server and the development web server for the angular app. This should open in a new browser window / tab.

*YOU SHOULD NOW HAVE A FUNCTIONING APPLICATION*


### Troubleshooting Initial App Setup ###

* Try going to the "One-Time Purchase" section. You should see a list of libraries. If you don't and/or you get an error message this means your mysql connection to the crm database is not working.


## Other Notes About the Applications ##

### Node vs Browser Environment ###
Because parts of the app run in the browser (the Angular apps) and some run in Node (the middleware) some of the code needs to be aware of which environment it is running in. This is because the code in the CARLI directory is common to the front-end and the back-end. In order to avoid things like checking for specific environment clues, the main modules in CARLI require environment-dependent modules from the config folder. These are actually re-written on disk to point to the browser or the Node version, depending which one is needed. This also lets Browserify find them.

When setting up a project from scratch these files will be missing initially. To fix this, go into the config directory and run `grunt jsenv:node`. This is the default mode when not building the web app or running the development web server. You do not need to worry which mode it is in ordinarily because the grunt tasks make sure to set it. If a grunt tasks should fail with an error, then it may leave the modules in the wron environment. So the safest thing is to always run `grunt jsenv:node` after any grunt task failure.

### Live Reloading ###
The development server will auto-refresh when pertinent project files are changed.
Keep an eye on the terminal window to see what happens. Different tasks are run depending on which type of file changed:

* Gruntfile.js - the Gruntfile is reloaded
* Any .js file in carliApp/ - the file will be linted and karma tests will run, then the server will reload.
* If any .js file is added or removed from carliApps/ then the server will reload with an updated index.html containing the correct script tags. (This may not be 100% working).
* If index.html changes the server reloads with the new index.html
* If any .spec.js (test files) change, they are linted and then karma will re-run the tests.


### Other Grunt Tasks ###
The following shortcut tasks are defined. See the [Gruntfile](../Gruntfile.js) for more details.

* `grunt build` - generates a clean build of the project for the dev server. Files are copied to the __build/__ directory.
* `grunt test` - does a clean build then runs the tests. Outputs a junit XML file of the results.
* `grunt serve` - builds and starts a live-reloading server. Opens index.html in a browser window.
* `grunt compile` - packages and minifies the app for deployment. Files are copied into the __dist/__ directory.
* `grunt ngdoc` - build Angular JS documentaion for the application.


### Technology Used ###
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


### How to Add a New Front-End Third Party Dependency (Bower Module) ###
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


### Note for Debian and Ubuntu users installing Node via apt-get ###
See [this article](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager) for special installation steps.

[Google Best Practices Doc]: https://docs.google.com/a/pixotech.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/mobilebasic?pli=1
[Angular Style Guide]: https://github.com/toddmotto/angularjs-styleguide 
[Writing AngularJS Documentation]: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation

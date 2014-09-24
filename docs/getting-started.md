# Getting Started #

## Install Node ##
The development environment depends heavily on Node and npm.
Visit the [Node Web Site](http://nodejs.org/) for installation instructions.


### In the root of the project run: ###
* `sudo npm install`
* `sudo npm install -g grunt-cli`
* `sudo npm install -g bower`
* `bower install`


### To build the project and start a local development server: ###
* `grunt serve`

This will auto-refresh when pertinent project files are changed. Keep an eye on the terminal window to see unit test
results, which are run automatically when .spec files change.


### Grunt Tasks ###
The following shortcut tasks are defined. See the [Gruntfile](../Gruntfile.js) for more details.

* build - generates a clean build of the project. Files are copied to the __build/__ directory.
* test - does a clean build then runs the tests. Outputs a junit XML file of the results.
* serve - builds and starts a live-reloading server. Opens index.html in a browser window.
* compile - does a clean build and packages the app for deployment. Files are copied into the __dist/__ directory.


### Notes for Linux Users ###
* PhantomJS requires a freetype shared library to run.
Install if you get an error like "Can't start PhantomJS":
`sudo apt-get install libfreetype6 libfontconfig`


### Note for Debian and Ubuntu users installing Node via apt-get ###
See [this article](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager) for special installation steps.


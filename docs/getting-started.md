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

This will auto-refresh when pertinent project files are changed. Keep an eye on the terminal window to see unit test
results, which are run automatically when JavaScript files change.


## Other Grunt Tasks ##
The following shortcut tasks are defined. See the [Gruntfile](../Gruntfile.js) for more details.

* `grunt build` - generates a clean build of the project. Files are copied to the __build/__ directory.
* `grunt test` - does a clean build then runs the tests. Outputs a junit XML file of the results.
* `grunt serve` - builds and starts a live-reloading server. Opens index.html in a browser window.
* `grunt compile` - does a clean build and packages the app for deployment. Files are copied into the __dist/__ directory.


### Notes for Linux Users ###
* PhantomJS requires a freetype shared library to run.
Install if you get an error like "Can't start PhantomJS":
`sudo apt-get install libfreetype6 libfontconfig`


### Note for Debian and Ubuntu users installing Node via apt-get ###
See [this article](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager) for special installation steps.


# CARLI Select #

[JIRA] | [Basecamp] | [Git] | [Jenkins]

Instances:
* [QA]
* [Development]


### Setup ###
See [Getting Started] for instructions to setup the project and start working.


### Technology Used ###
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


### Organization ###
* The client application is organized according to the [Google Best Practices Doc]
  * Top-level __app/__ directory contains index.html and main app config.
  * __app/sections/__ contains a directory for each main section of the app and routing configuration for the sections.
  * __app/components/__ contains a directory for each UI component (re-usable and otherwise).
  * Test files for all of the above live alongside the code they test, and end with .spec.js.
  * Top-level __CARLI/__ directory contains models and tests. Code there can use Node-style requires and exports. It is all packaged up by **Browserify**.


[JIRA]: https://jira.pixotech.com/browse/CARLI
[Basecamp]: https://pixotech.basecamphq.com/projects/11139052-carli-web-application-phase-iii
[Git]: https://bitbucket.org/pixotech/carli-select
[Jenkins]: https://jenkins.pixotech.com/job/view/CARLI
[Development]: http://carli.dev.pixotech.com
[QA]: http://carli.qa.pixotech.com
[Google Best Practices Doc]: https://docs.google.com/a/pixotech.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/mobilebasic?pli=1
[Getting Started]: docs/getting-started.md
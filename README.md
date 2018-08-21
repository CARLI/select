# CARLI Select #

Welcome to the CARLI Selection System, a suite of web apps enabling the staff of [CARLI](https://www.carli.illinois.edu/) 
to manage and facilitate periodic product selection cycles. In this repository you will find the following:

   * Three Angular 1.x applications and common modules shared by all three (browserClient/)
   * A collection of Node modules containing business rules and unit tests (CARLI/)
   * Documentation for working with the source code and running a local instance (docs/)
   * a suite of build tools written in Grunt (grunt/)
   * An Express API server that handles complex queries and privileged database access (middleware/)
   * JSON schema definitions for the data types in the system (schemas/)

## Front-End Setup ##
See [Getting Started] for instructions to setup the project and start working on the browser client.

## Project Wide Tasks ##
A bash script called `./install-dependencies.sh` is provided to install all npm dependencies for the various parts of the project.

Grunt is used as a task runner at multiple levels of the project.  The following tasks are available at the top level:

* `grunt serve`: Run a development web server for the apps and a local copy of the api. Along with a running couch database
  and the appropriate configuration this will get you a working local instance of the system.
* `grunt test`: Run all tests for the project.

View the [Full Documentation].

[Getting Started]: docs/getting-started-browser-client.md 
[Full Documentation]: docs/index.md




# CARLI Select #

[JIRA] | [Basecamp] | [Git] | [Jenkins]

Instances:
* [QA]
* [Development]


## Front-End Setup ##
See [Getting Started] for instructions to setup the project and start working on the browser client.


## Organization ##
* __CARLI/__ directory contains models and tests. Code there can use Node-style requires and exports. It is all packaged up by **Browserify**.
* __browserClient/__ directory contains all the setup and code for the front end.
* __docker/__ directory contains scripts for building docker containers for deployment.
* __docs/__ is the project documentation.
* __jenkins/__ contains scripts for Jenkins to run to build and deploy the project.

[JIRA]: https://jira.pixotech.com/browse/CARLI
[Basecamp]: https://pixotech.basecamphq.com/projects/11139052-carli-web-application-phase-iii
[Git]: https://bitbucket.org/pixotech/carli-select
[Jenkins]: https://jenkins.pixotech.com/job/view/CARLI
[Development]: http://carli.dev.pixotech.com
[QA]: http://carli.qa.pixotech.com
[Getting Started]: carli-select/src/develop/docs/getting-started-browser-client.md


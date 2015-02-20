# CARLI deployment process

## Jobs

* CARLI Build Dev
  * Create container images for the project build, nginx and couchdb from the latest `develop` branch.
  * Tag images `latest`
  * Run project tests
  * If tests pass, tag images `last-good`
  * Deploy the `latest` containers to http://carli.dev.pixotech.com (Note: these may be broken, since `latest` is used rather than `last-good`)

* CARLI Build QA
  * Deploy the `last-good` containers to http://carli.qa.pixotech.com

* CARLI Build Prod
  * Deploy the `last-good` containers to http://carli-select.carli.illinois.edu


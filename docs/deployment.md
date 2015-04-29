
# Continous Integration

Jenkins jobs are triggered by pushes to the Git repository.  Each job runs a single shell script, which does the heavy lifting for the task.  These scripts reside in `./jenkins/jobs/` and are named the same as the name of the job in Jenkins.

Helper scripts used by the top-level jobs are included in `./jenkins/scripts`.

## CARLI - Build Dev

Run on each push to develop

* A container with the environment needed to run grunt is built, and then `grunt test` is run in the container.
    * This container is defined by `docker/grunt/Dockerfile` 
* If the tests pass, then `grunt serve` is run in the same container. (Currently on the same machine that does the jenkins build), 
* `grunt serve` listens on port 8000, which is mapped to port 9090 on vmhost.
* A proxy server on louise directs traffic for `carli.dev.pixotech.com` to `vmhost:9090`.

## CARLI - Build QA

Run on each push to QA

* This job is the same as Build Dev, except: `carli.qa.pixotech.com` &rarr; `docker1:9080`.


# Bower

This project originally used Bower for front-end dependencies. 
When Bower was deprecated circa 2017 we removed the dependency from the project but froze the bower_modules directory 
and build configuration so as not to change their behavior. But Bower is no longer in the project or used to manage the 
front end modules. 

## Old JSON
This is a snapshot of the bower.json file at the time it was removed:
```
{
  "name": "CARLI Select",
  "dependencies": {
    "angular": "~1.3.*",
    "angular-route": "~1.2.25",
    "angular-resource": "~1.2.26",
    "angular-sanitize": "~1.3.1",
    "angular-bootstrap": "~0.12.0",
    "angular-animate": "~1.3.9",
    "gsap": "~1.15.0",
    "font-awesome": "~4.3.0",
    "angular-busy": "~4.1.2",
    "handlebars": "~3.0.0",
    "angular-busyclick": "*",
    "ng-tags-input": "~2.3.0",
    "moment": "~2.10.2",
    "FileSaver": "*"
  },
  "devDependencies": {
    "angular-mocks": "~1.2",
    "bootstrap-sass-official": "~3.2.0",
    "angular-slider": "~0.2.14"
  },
  "resolutions": {
    "angular": "~1.3.*"
  }
}
```

## Plan to Remove bower_modules/

One by one, go through the list of dependencies above and
   1. Install via other means (npm)
   1. Replace path in build.config
   1. Verify build and feature in site still work as expected
   1. Remove old code from bower_modules/

Eventually, all of bower_modules/ can be removed.
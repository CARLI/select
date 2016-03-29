# Steps to update production

1. Move master branch
1. Cherry-pick "disable masquerade"
1. Increase version number in package.json
1. Run Jenkins job
1. Update develop version number in package.json

## *IMPORTANT: If there are any changes in db/designDocs then the production push will be more involved. These steps are
suitable for updating the app code only. Please check with the tech lead if there are design document changes to push.*

## 1 - Move master branch
The `master` branch points to the production-ready source  code. Generally we set master to wherever the `staging` 
branch is at, since that has been on QA long enough to verify. Make sure all of your branches are up to date before proceeding.
 
We don't follow git-flow religiously, so we don't insist on merging staging into master. You can use whatever method of 
moving the master you prefer, but the suggested method below keeps the history cleaner:

   * `git branch -f master staging`

## 2 - Cherry-pick "feature toggle" commits
Sometimes there are features that aren't ready for production and are hidden in code. You might need to include a commit
to the master branch to keep them disabled (check with the tech lead).

   * find the commit and `git cherry-pick <commit reference>` 

## 3 - Up version number
When pushing to production, it's important to update the version number in the package.json file in the root of the
project. This is used by Grunt to name the compiled CSS and JavaScript files, and ensure that the client gets the new
code without having to clear their cache.

The general strategy is to bump the version number after pushing, and add '-dev' afterwards, so whatever version is 
currently in package.json should be the next release version. Edit the package.json file and remove '-dev'. Commit that 
to the master branch.

Push the master branch to origin. You'll probably need to force push:

   * `git push -f origin master`

## 4 - Run Jenkins Job
Log into Jenkins and run the job called *CARLI - Build & Publish Production*
It takes care of building the compiled production web code, packaging it, transferring it to production, and updating
the web server on the production server to point to the new version.


## 5 - Update version number for development
Back on develop, update the version in package.json to the next version number and put back the '-dev' suffix. Commit.

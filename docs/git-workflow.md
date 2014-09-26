# Git Workflow

## Branches

* **`master`**: Deployed to production
* **`qa`**: Deployed to QA server
* **`develop`**: Mainline development branch
    * All commits to `develop` are merges of topic branches.

## Topic branches

* All work is done in topic branches, branched off of develop.
* Topic branches should be named for the ticket being worked on.  (`CARLI-123`, or `CARLI-123/something if desired)
* Topic branches must be merged by pairs.
* Work done outside of a pair should have a pull request submitted, which will then be reviewed and merged by a pair.

## Commit messages

* Commit messages contain the ticket being worked on (`CARLI-123`)
* The first line should be a short descriptive one-line summary of changes made, (preferably 50 characters or less)
* If further elaboration is needed, a blank line should separate the subject line from the rest of the message.

## Pairing

* At the start of each pairing session, or when handling a pull request, the name in the Git configuration should be changed for the current pair.  For consistency, put the names in alphabetical order.
    * `git config user.name "Link and Zelda"`



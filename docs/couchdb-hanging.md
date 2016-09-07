
History: We have seen the application hang after pushing large updates (specifically, changes to design docs that
require re-indexing the cycle databases). The symptom we see in the CouchDb status is that it shows it is indexing
a large number of databases, but the indexing jobs do not appear to be making any progress, even after being left for
a long time (overnight).

The workaround: rather than indexing all databases at once, we trigger the indexes in smaller chunks. There are scripts
in the repository to help recover from this:

* `./bin/index-all-databases` does indexes all databases for all cycles.
* `./bin/index-databases-for-cycle <cycleId>` indexes the databases only for the specified cycle.
* `./bin/list-cycles` shows cycle info (to get the cycleId to use in the previous command)

We have never needed to break it into smaller chunks than doing single cycles at a time.

Note: under normal circumstances, CouchDb will keep itself indexed and it is not necessary to trigger manually.

See [CARLI-1421](https://jira.pixotech.com/browse/CARLI-1421)

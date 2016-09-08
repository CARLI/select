## Overview
Couchdb includes a decent utility called 'futon' that allows for some manual viewing and editing of data. This can be
useful to resolve minor data issues or to correct actions that don't have interfaces in the applications.

On production, futon is at: http://select-prod.carli.illinois.edu/db/_utils/index.html
When running couch locally it is found at: http://localhost:5984/_utils/index.html

## Common tasks

### Get replication and indexing job status

Especially useful if the system is unresponsive. Log into futon and select 'Status' from the sidebar on the right. This
will display any current replication jobs and percent complete. If there are a lot of jobs piled up here it sometimes
happens that couch seems to get stuck. A restart of couch will clear the jobs, but if something triggers them again it
can get stuck again. There are API routes in the middleware to trigger specific replications. Indexing can be triggered
by attempting to view the documents in a database. e.g. by clicking the database name on the main screen of futon.

### examining a specific offering

It is often very useful to examine the offering data directly in the database. If you can find the id of the offering
document you can jump right to it in futon. The ng-inspector extension for chrome makes it relatively easy to find the
id of an offering. The cycle screens in the staff app show one row per offering, so find the vendor + product you are
interested in and inspect the row for the library. If you have the inspector extension turned on you will be able to see
the angular data in the $scope tab and that will include the offering id.

Once you have the id, go the database in futon for the cycle you were using. Click any random document to open it (click 
the green text in the left column) and then replace the last ID in the URL with the id of the offering you found.

You can also edit the offering data directly here, which can sometimes be useful to fix corrupted data. Note that there
are corresponding vendor databases for each cycle with replicated copies of the offerings, so you do have to sync changes
to those if you edit an offering.

### delete a problematic user directly

In rare cases a user or document might get strange characters or other bad data that messes up the browser app. If this
happens and prevents the entity from being deleted or corrected in the app, futon is a good solution. If you know the id
of the document you can use the technique above to edit or delete the document. If the problem is with a user, find them
in the global `_users` table and edit or delete there.



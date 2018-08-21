## System Design

Nginx serves up the three web apps, and also acts as a proxy to expose both the middleware api and database api to the apps.
Much of the system runs client-side in the Angular app, and many database interactions happen directly from the client to
Couch. The API comes into play when the query is too complex to be practical client-side, or the database operation requires
admin access (e.g creating a new cycle). 

## Authentication

Couch is the central authority for user authentication. The login process via the angular app goes through the middleware 
which passes on the attempt to Couch. If successful, the authentication token for couch will also be used for the middleware
and Angular apps. Users are stored directly in the built-in couch user database.

## Database Design

Couch is used as the data store for almost every part of the system. Therefore any change a staff member, vendor, or library
customer wants to make will eventually end up in a database change. Most changes are small enough to be made directly.
Changing the Site License price for one product for one library for example, can be done directly by the client-side Angular
code with a direct PUT of the couch document in question.

All entities are stored as generic documents, but include a "type" property for the application's use. The type is always
matched against the associated JSON schema to validate the contents of the document. This happens in the repository modules (in CARLI/).

The database stores references to other objects in the database, not the full objects.  However, Angular uses the
full objects. For example, a Product is "owned by" a Vendor, and references a License entity, which are stored in the
Product documents as the ids of those references, not the actual objects. So when loading a Product from the database,
there is a layer in the repositories that does a second query to find the Vendor object by id and replaces the id property
of the Product with the loaded Vendor object. The same for the License. And when saving changes to a Product, the repository
replaces the Vendor and License properties with the id of the associated objects.

Assumptions about what data exists where are:

1. Angular always has full access to an object, and doesn't have to muck with converting IDs to objects or vice versa.
2. Conversion happens in the Repository layer: Create/Update replace objects with IDs and Load/List replace IDs with objects.
3. When an entity is created or updated, the Repository returns only the ID of the entity.  Angular must re-load the
entity from the database if it wants that entity to be modified again by the database.
4. When a Repository loads an Object it attaches useful helper functions to the object, which can reference its
sub-objects (i.e. the Vendor that a Product belongs to). The motivating use case for this is to have a method on a Product
instance that tells whether the Product is active, taking into account the product's own isActive status as well as the
 Vendor's.

### Non-couch persistence

There are two little bits of data that are stored in files rather than the database. They are used by the middleware when
generating invoices, and each one is stored in its own file which gets updated in place when used. They are the last used
invoice number and the last used batch id. Both of these need to be incremented each time they are used and both are
critical for generating invoices. We use the synchronous file operations in Node to read and increment the values. The 
default location for these two files is /var/local/carli/.


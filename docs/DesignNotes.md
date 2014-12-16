



The database stores references to other objects in the database, not the full objects.  However, Angular uses the
full objects. For example, a product contains a vendor and a license entity, which are stored in the db as IDs, not
the full object.

As such, entity repositories have to convert objects to IDs before storing in the database, and when loading those
entities, extract the full object from the database.

So, expectations are:

1. Angular always has full access to an object, and doesn't have to muck with converting IDs to objects or vice versa.
2. Conversion happens in the Repository layer: Create/Update replace objects with IDs and Load/List replace IDs with objects.
3. When an entity is created or updated, the Repository returns only the ID of the entity.  Angular must re-load the
entity from the database if it wants that entity to be modified again by the database.
4. When a Repository loads an Object it attaches useful helper functions to the object, which can reference its
sub-objects (i.e. the Vendor that a Product belongs to). The motivating use case for this is to have a method on a Product
instance that tells whether the Product is active, taking into account the product's own isActive status as well as the
 Vendor's.

Notes:
* The object reference passed into a Repository's create and update methods is not modified. The id is returned.
*





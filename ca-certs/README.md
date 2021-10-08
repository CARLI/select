# CA Root Certificates

In September 2021 the Root CA Cert for Let's Encrypt expired. This caused problems
for the CARLI Select project which uses a number of  Let's Encrypt certificates.
Because Node.js bundles its own CA certificates and it was not going to be
trivial to update the project to the latest version of Node with updated
certificates, we decided to simply bundle our own CA certificates and run
Node with the `--use-openssl-ca` option to override its built-in certificate
bundle.

## Warning
These certificates should only be updated from a trusted source! Installing
an untrusted CA Certificate can lead to *very bad things*!